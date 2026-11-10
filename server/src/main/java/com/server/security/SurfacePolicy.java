package com.server.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * Çalışan yüzeyin (app.surface) tek okunduğu yer. Prod profilinde APP_SURFACE zorunludur ve sadece public ya da internal
 * olabilir; iki yüzeyi birden açan "all" prod'da uygulamayı açtırmaz.
 */
@Slf4j
@Component
public class SurfacePolicy {

    private final Surface surface;

    public SurfacePolicy(@Value("${app.surface}") String surface, Environment environment) {
        this.surface = Surface.parse(surface);
        if (this.surface == Surface.ALL && environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new IllegalStateException("APP_SURFACE must be 'public' or 'internal' in the prod profile");
        }
        log.info("Application surface: {}", this.surface);
    }

    public Surface surface() {
        return surface;
    }

    public boolean allowsLogin(Role role) {
        return surface.allowsLogin(role);
    }
}
