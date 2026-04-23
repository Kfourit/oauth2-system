package com.example.authservice.controller;

import com.example.authservice.entity.User;
import com.example.authservice.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private UserService userService;
    @InjectMocks private AuthController authController;

    private MockMvc mockMvc;
    private final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    void setUp() {
        var validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setValidator(validator)
                .build();
    }

    @Test
    void register_validRequest_returns201WithUserBody() throws Exception {
        var saved = new User();
        saved.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        saved.setEmail("alice@example.com");
        saved.setName("Alice");

        when(userService.register("Alice", "alice@example.com", "secret")).thenReturn(saved);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of(
                        "name", "Alice",
                        "email", "alice@example.com",
                        "password", "secret"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000001"));
    }

    @Test
    void register_duplicateEmail_returns400WithMessage() throws Exception {
        when(userService.register(any(), any(), any()))
                .thenThrow(new IllegalArgumentException("Email already taken"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of(
                        "name", "Bob",
                        "email", "dup@example.com",
                        "password", "pass"))))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email already taken"));
    }

    @Test
    void register_blankName_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of(
                        "name", "",
                        "email", "carol@example.com",
                        "password", "pass"))))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void register_invalidEmailFormat_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of(
                        "name", "Dave",
                        "email", "not-an-email",
                        "password", "pass"))))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void register_blankPassword_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of(
                        "name", "Eve",
                        "email", "eve@example.com",
                        "password", ""))))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }
}
