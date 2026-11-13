package com.server.modules.auth;

import com.server.modules.user.Emails;
import com.server.modules.user.User;
import com.server.modules.user.UserRepository;
import com.server.security.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Yerel geliştirmede Mezun Portalı'nı denemek için kısa bilgili bir USER hesabı açar (varsayılan: 1 / 1).
 * DevLoginController ile aynı bayrağa bağlıdır (app.dev-login.enabled, sadece application-dev.yml'de true);
 * prod'da ve Compose'da bean oluşmaz. Hesap zaten varsa dokunulmaz.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.dev-login.enabled", havingValue = "true")
public class DevUserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public DevUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                         @Value("${app.dev-login.user-email}") String email,
                         @Value("${app.dev-login.user-password}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = Emails.normalize(email);
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName("Oğuzhan Demircioğlu");
        user.setRole(Role.USER);
        user.setActive(true);
        userRepository.save(user);
        log.info("Dev USER hesabı oluşturuldu: {}", email);
    }
}
