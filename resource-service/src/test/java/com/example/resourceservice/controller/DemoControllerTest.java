package com.example.resourceservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DemoControllerTest {

    @Autowired MockMvc mockMvc;

    // Prevents Spring from fetching JWKs at startup. The jwt() post-processor
    // injects the SecurityContext directly so this mock is never called.
    @MockBean JwtDecoder jwtDecoder;

    @Test
    void health_noAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void me_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withJwt_returnsSubjectEmailAndScope() throws Exception {
        mockMvc.perform(get("/api/me")
                .with(jwt().jwt(j -> j
                        .subject("user-123")
                        .claim("email", "alice@example.com")
                        .claim("scope", "openid profile read write"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("user-123"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.scope").value("openid profile read write"));
    }

    @Test
    void data_withReadScope_returns200() throws Exception {
        mockMvc.perform(get("/api/data")
                .with(jwt().jwt(j -> j.claim("scope", "read"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Here is your data"));
    }

    @Test
    void data_withoutReadScope_returns403() throws Exception {
        mockMvc.perform(get("/api/data")
                .with(jwt().jwt(j -> j.claim("scope", "openid"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_withWriteScope_returns200() throws Exception {
        mockMvc.perform(get("/api/admin")
                .with(jwt().jwt(j -> j.claim("scope", "write"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin operation successful"));
    }

    @Test
    void admin_withoutWriteScope_returns403() throws Exception {
        mockMvc.perform(get("/api/admin")
                .with(jwt().jwt(j -> j.claim("scope", "read"))))
                .andExpect(status().isForbidden());
    }
}
