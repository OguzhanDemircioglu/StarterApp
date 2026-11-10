package com.server.support;

import com.jayway.jsonpath.JsonPath;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Yüzey testlerinin (APP_SURFACE) ortak ayarları: her test sınıfı kendi bellek içi H2 veritabanıyla açılır, Docker gerekmez.
 */
public final class SurfaceTestSupport {

    public static final String ADMIN_EMAIL = "admin@test.local";
    public static final String ADMIN_PASSWORD = "Admin12345";

    private SurfaceTestSupport() {
    }

    public static void register(DynamicPropertyRegistry registry, String surface) {
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:surface_" + surface + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;"
                + "DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1;"
                + "INIT=CREATE SCHEMA IF NOT EXISTS starterapp");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("DB_SCHEMA", () -> "starterapp");
        registry.add("app.admin.email", () -> ADMIN_EMAIL);
        registry.add("app.admin.password", () -> ADMIN_PASSWORD);
        registry.add("app.session.cookie-secure", () -> "false");
        registry.add("app.surface", () -> surface);
        TestJwtKeys.register(registry);
    }

    public static ResultActions login(MockMvc mockMvc, String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"));
    }

    public static ResultActions register(MockMvc mockMvc, String email) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"fullName\":\"Test Mezun\",\"password\":\"User12345\"}"));
    }

    public static String accessToken(ResultActions loginResult) throws Exception {
        return JsonPath.read(loginResult.andReturn().getResponse().getContentAsString(), "$.data.accessToken");
    }

    public static MockHttpServletRequestBuilder withToken(MockHttpServletRequestBuilder request, String token) {
        return request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }
}
