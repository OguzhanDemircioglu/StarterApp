package com.server;

import com.server.modules.auth.AuthMessages;
import com.server.support.SurfaceTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * APP_SURFACE=public: dışarıya açık sunucu. Mezunlar kayıt olur ve girer; yönetim hesapları giremez, yönetim API'si yoktur.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PublicSurfaceIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        SurfaceTestSupport.register(registry, "public");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void graduateRegistersAndLogsInToThePortal() throws Exception {
        String email = "mezun-" + UUID.randomUUID() + "@test.local";
        register(mockMvc, email).andExpect(status().isOk());

        login(mockMvc, email, "User12345")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role").value("USER"))
                .andExpect(jsonPath("$.data.menus[0].route").value("/user"));
    }

    @Test
    void staffCannotLogInAndGetsTheSameAnswerAsAWrongPassword() throws Exception {
        login(mockMvc, ADMIN_EMAIL, ADMIN_PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(AuthMessages.INVALID_CREDENTIALS));
    }

    @Test
    void adminApiDoesNotExistHere() throws Exception {
        String email = "mezun-" + UUID.randomUUID() + "@test.local";
        register(mockMvc, email).andExpect(status().isOk());
        String token = accessToken(login(mockMvc, email, "User12345"));

        mockMvc.perform(withToken(get("/api/admin/categories"), token)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
    }
}
