package com.server;

import com.server.modules.auth.AuthMessages;
import com.server.support.SurfaceTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static com.server.support.SurfaceTestSupport.ADMIN_EMAIL;
import static com.server.support.SurfaceTestSupport.ADMIN_PASSWORD;
import static com.server.support.SurfaceTestSupport.accessToken;
import static com.server.support.SurfaceTestSupport.login;
import static com.server.support.SurfaceTestSupport.register;
import static com.server.support.SurfaceTestSupport.withToken;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * APP_SURFACE=internal: kapalı ağdaki sunucu. Sadece ADMIN ve SUPERADMIN girer; kayıt ve portal kapalıdır.
 */
@SpringBootTest
@AutoConfigureMockMvc
class InternalSurfaceIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        SurfaceTestSupport.register(registry, "internal");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void superadminLogsInAndSeesOnlyAdminMenus() throws Exception {
        String token = accessToken(login(mockMvc, ADMIN_EMAIL, ADMIN_PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role").value("SUPERADMIN"))
                .andExpect(jsonPath("$.data.menus[*].route", not(hasItem("/user")))));

        mockMvc.perform(withToken(get("/api/admin/categories"), token)).andExpect(status().isOk());
    }

    @Test
    void registrationIsClosed() throws Exception {
        register(mockMvc, "mezun-" + UUID.randomUUID() + "@test.local").andExpect(status().isUnauthorized());
    }

    @Test
    void graduateCannotLogInHere() throws Exception {
        String token = accessToken(login(mockMvc, ADMIN_EMAIL, ADMIN_PASSWORD));
        String email = "mezun-" + UUID.randomUUID() + "@test.local";
        mockMvc.perform(withToken(post("/api/admin/users"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"fullName\":\"Mezun\",\"password\":\"User12345\",\"role\":\"USER\"}"))
                .andExpect(status().isOk());

        login(mockMvc, email, "User12345")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(AuthMessages.INVALID_CREDENTIALS));
    }
}
