package com.server.modules.auth;

import com.server.modules.user.User;
import com.server.modules.user.UserRepository;
import com.server.security.Role;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Geliştirme USER hesabı sadece dev-login açıkken oluşur ve var olan hesaba dokunulmaz.
 */
class DevUserSeederTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final DevUserSeeder seeder = new DevUserSeeder(userRepository, passwordEncoder, "1", "1");

    @Test
    void seederDoesNotExistUnlessDevLoginEnabled() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withBean(UserRepository.class, () -> userRepository)
                .withBean(PasswordEncoder.class, () -> passwordEncoder)
                .withPropertyValues("app.dev-login.user-email=1", "app.dev-login.user-password=1")
                .withUserConfiguration(DevUserSeeder.class);

        runner.run(context -> assertThat(context).doesNotHaveBean(DevUserSeeder.class));
        runner.withPropertyValues("app.dev-login.enabled=true")
                .run(context -> assertThat(context).hasSingleBean(DevUserSeeder.class));
    }

    @Test
    void createsActiveUserWhenMissing() {
        when(userRepository.findByEmail("1")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("1")).thenReturn("hash");

        seeder.run(new DefaultApplicationArguments());

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getEmail()).isEqualTo("1");
        assertThat(saved.getValue().getPassword()).isEqualTo("hash");
        assertThat(saved.getValue().getRole()).isEqualTo(Role.USER);
        assertThat(saved.getValue().isActive()).isTrue();
    }

    @Test
    void leavesExistingUserAlone() {
        when(userRepository.findByEmail("1")).thenReturn(Optional.of(new User()));

        seeder.run(new DefaultApplicationArguments());

        verify(userRepository, never()).save(any());
    }
}
