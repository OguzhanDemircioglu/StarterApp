package com.server.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Set;

/**
 * Yetki kuralları yola göredir: /api/admin/** ADMIN (ve onu kapsayan SUPERADMIN), /api/portal/** USER ister; geri kalan
 * her şey için giriş yapmış olmak yeterlidir. Çalışan yüzey (APP_SURFACE, bkz. Surface) o yüzeyde olmayan yolları
 * tamamen kapatır: dışarıya açık sunucuda yönetim API'si, kapalı ağdaki sunucuda kayıt ve portal API'si yoktur.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** Yönetim paneli API'si (kapalı ağ). */
    private static final String ADMIN_PATHS = "/api/admin/**";

    /** Mezun Portalı API'si (dışarıya açık). */
    private static final String PORTAL_PATHS = "/api/portal/**";

    private static final String REGISTER_PATH = "/api/auth/register";

    /** Token gerektirmeyen auth endpoint'leri. */
    private static final Set<String> PUBLIC_AUTH_PATHS = Set.of(
            "/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout", "/api/auth/dev-login");

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   RestAuthenticationEntryPoint authenticationEntryPoint,
                                                   RestAccessDeniedHandler accessDeniedHandler,
                                                   SurfacePolicy surfacePolicy) throws Exception {
        Surface surface = surfacePolicy.surface();
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    // Bu yüzeyde olmayan yollar: kimse erişemez (nginx de aynı yolları dışarı vermez).
                    if (!surface.servesAdmin()) {
                        auth.requestMatchers(ADMIN_PATHS).denyAll();
                    }
                    if (!surface.servesPortal()) {
                        auth.requestMatchers(PORTAL_PATHS).denyAll();
                        auth.requestMatchers(HttpMethod.POST, REGISTER_PATH).denyAll();
                    }
                    auth
                        .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_PATHS.toArray(String[]::new)).permitAll()
                        .requestMatchers("/actuator/health/**", "/error").permitAll()
                        // Swagger yalnızca dev profilinde açıktır (springdoc ayarı); prod'da bu yollar 404 döner.
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(ADMIN_PATHS).hasRole(Role.ADMIN.name())
                        .requestMatchers(PORTAL_PATHS).hasRole(Role.USER.name())
                        .anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(bearerTokenResolver())
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler));
        return http.build();
    }

    /**
     * SUPERADMIN, ADMIN'in bütün yetkilerini taşır. USER bilerek hiyerarşide yoktur: yönetim kullanıcıları portala giremez.
     * Hem yol kuralları hem @PreAuthorize bu bean'i kullanır.
     */
    @Bean
    public static RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withDefaultRolePrefix()
                .role(Role.SUPERADMIN.name()).implies(Role.ADMIN.name())
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * Login/refresh/logout isteklerinde Authorization başlığı yok sayılır. Böylece frontend süresi dolmuş
     * bir access token'ı yanlışlıkla gönderse bile refresh çalışmaya devam eder.
     */
    private static BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        return (HttpServletRequest request) ->
                PUBLIC_AUTH_PATHS.contains(request.getRequestURI()) ? null : delegate.resolve(request);
    }

    private static JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName(JwtClaims.ROLE);
        authorities.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }
}
