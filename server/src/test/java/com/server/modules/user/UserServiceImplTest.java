package com.server.modules.user;

import com.server.common.exception.BusinessException;
import com.server.modules.auth.UserSessionRepository;
import com.server.modules.user.dto.UserUpdateRequest;
import com.server.security.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository repository;
    @Mock
    private UserSessionRepository sessionRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new UserServiceImpl(repository, new UserMapperImpl(), sessionRepository, passwordEncoder);
    }

    @Test
    void lastActiveAdminCannotBeDeactivated() {
        when(repository.findById(1L)).thenReturn(Optional.of(user(1L, Role.ADMIN, true)));
        when(repository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.update(1L, new UserUpdateRequest("admin@firma.com", "Admin", Role.ADMIN, false, 0L)))
                .isInstanceOf(BusinessException.class)
                .hasMessage(UserMessages.LAST_ADMIN);
    }

    @Test
    void lastActiveAdminCannotBeDeleted() {
        when(repository.findById(1L)).thenReturn(Optional.of(user(1L, Role.ADMIN, true)));
        when(repository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage(UserMessages.LAST_ADMIN);
    }

    @Test
    void deactivatingUserRevokesAllSessions() {
        User user = user(2L, Role.USER, true);
        when(repository.findById(2L)).thenReturn(Optional.of(user));
        when(repository.saveAndFlush(user)).thenReturn(user);

        service.update(2L, new UserUpdateRequest("ali@firma.com", "Ali", Role.USER, false, 0L));

        assertThat(user.isActive()).isFalse();
        verify(sessionRepository).revokeAllByUserId(eq(2L), any());
    }

    @Test
    void emailIsNormalizedIndependentOfDefaultLocale() {
        Locale original = Locale.getDefault();
        try {
            Locale.setDefault(Locale.forLanguageTag("tr-TR"));
            assertThat(Emails.normalize("  ADMIN@FIRMA.COM ")).isEqualTo("admin@firma.com");
            assertThat(Emails.normalize("İsmail@firma.com")).isEqualTo("ismail@firma.com");
            assertThat(Emails.normalize("admin@test.local".toUpperCase())).isEqualTo("admin@test.local");
        } finally {
            Locale.setDefault(original);
        }
    }

    private static User user(Long id, Role role, boolean active) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@firma.com");
        user.setFullName("User " + id);
        user.setRole(role);
        user.setActive(active);
        user.setVersion(0L);
        return user;
    }
}
