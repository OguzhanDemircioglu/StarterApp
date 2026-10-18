package com.server.modules.user;

import com.server.common.exception.BusinessException;
import com.server.common.service.BaseServiceImpl;
import com.server.modules.auth.UserSessionRepository;
import com.server.modules.user.dto.UserCreateRequest;
import com.server.modules.user.dto.UserPasswordResetRequest;
import com.server.modules.user.dto.UserResponse;
import com.server.modules.user.dto.UserUpdateRequest;
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

    public UserServiceImpl(UserRepository repository, UserMapper mapper,
                           UserSessionRepository sessionRepository, PasswordEncoder passwordEncoder) {
        super(repository, mapper);
        this.userRepository = repository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
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
        boolean losesAdminRights = request.role() != Role.ADMIN || !request.active();
        if (isLastActiveAdmin(entity) && losesAdminRights) {
            throw new BusinessException(UserMessages.LAST_ADMIN);
        }
    }

    @Override
    protected void validateDelete(User entity) {
        if (isLastActiveAdmin(entity)) {
            throw new BusinessException(UserMessages.LAST_ADMIN);
        }
    }

    /** Sistemde admin kalmazsa kimse kullanıcı yönetemez; son aktif admin korunur. */
    private boolean isLastActiveAdmin(User user) {
        return user.getRole() == Role.ADMIN && user.isActive()
                && userRepository.countByRoleAndActiveTrue(Role.ADMIN) <= 1;
    }
}
