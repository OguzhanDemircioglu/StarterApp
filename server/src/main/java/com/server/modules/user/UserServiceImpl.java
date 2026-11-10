package com.server.modules.user;

import com.server.common.exception.BusinessException;
import com.server.common.service.BaseServiceImpl;
import com.server.modules.auth.UserSessionRepository;
import com.server.modules.user.dto.UserCreateRequest;
import com.server.modules.user.dto.UserPasswordResetRequest;
import com.server.modules.user.dto.UserResponse;
import com.server.modules.user.dto.UserUpdateRequest;
import com.server.security.CurrentUser;
import com.server.security.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class UserServiceImpl extends BaseServiceImpl<User, UserCreateRequest, UserUpdateRequest, UserResponse>
        implements UserService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;

    public UserServiceImpl(UserRepository repository, UserMapper mapper,
                           UserSessionRepository sessionRepository, PasswordEncoder passwordEncoder,
                           CurrentUser currentUser) {
        super(repository, mapper);
        this.userRepository = repository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUser = currentUser;
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        UserResponse response = super.update(id, request);
        if (!request.active()) {
            sessionRepository.revokeAllByUserId(id, Instant.now());
        }
        return response;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        super.delete(id);
        sessionRepository.revokeAllByUserId(id, Instant.now());
    }

    @Override
    @Transactional
    public void resetPassword(Long id, UserPasswordResetRequest request) {
        User user = findEntity(id);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        sessionRepository.revokeAllByUserId(id, Instant.now());
    }

    @Override
    protected void validateCreate(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(UserMessages.EMAIL_EXISTS);
        }
        // Kayıt (register) her zaman USER oluşturur ve giriş gerektirmez; yönetici hesabı açmak SUPERADMIN işidir.
        if (request.role().isStaff()) {
            requireSuperadmin();
        }
    }

    @Override
    protected void prepareCreate(User entity, UserCreateRequest request) {
        entity.setPassword(passwordEncoder.encode(request.password()));
    }

    @Override
    protected void validateUpdate(User entity, UserUpdateRequest request) {
        if (userRepository.existsByEmailAndIdNot(request.email(), entity.getId())) {
            throw new BusinessException(UserMessages.EMAIL_EXISTS);
        }
        if (entity.getRole().isStaff() || request.role().isStaff()) {
            requireSuperadmin();
        }
        boolean losesSuperadminRights = request.role() != Role.SUPERADMIN || !request.active();
        if (isLastActiveSuperadmin(entity) && losesSuperadminRights) {
            throw new BusinessException(UserMessages.LAST_ADMIN);
        }
    }

    @Override
    protected void validateDelete(User entity) {
        if (entity.getRole().isStaff()) {
            requireSuperadmin();
        }
        if (isLastActiveSuperadmin(entity)) {
            throw new BusinessException(UserMessages.LAST_ADMIN);
        }
    }

    /** Sistemde süper yönetici kalmazsa kimse yönetici hesabı yönetemez; son aktif SUPERADMIN korunur. */
    private boolean isLastActiveSuperadmin(User user) {
        return user.getRole() == Role.SUPERADMIN && user.isActive()
                && userRepository.countByRoleAndActiveTrue(Role.SUPERADMIN) <= 1;
    }

    /** ADMIN sadece USER hesaplarını yönetir; ADMIN ve SUPERADMIN hesaplarına sadece SUPERADMIN dokunur. */
    private void requireSuperadmin() {
        if (currentUser.findId().isEmpty() || currentUser.role() != Role.SUPERADMIN) {
            throw new BusinessException(UserMessages.STAFF_SUPERADMIN_ONLY);
        }
    }
}
