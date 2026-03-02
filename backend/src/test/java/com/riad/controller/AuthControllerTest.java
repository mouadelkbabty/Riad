package com.riad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.riad.domain.enums.Role;
import com.riad.dto.request.LoginRequest;
import com.riad.dto.request.RegisterRequest;
import com.riad.dto.response.AuthResponse;
import com.riad.dto.response.UserResponse;
import com.riad.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController - Tests d'intégration Web")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private AuthResponse buildAuthResponse(String email) {
        UserResponse user = new UserResponse(1L, "Test", "User", email, "+212600000001",
                Role.GUEST, false, LocalDateTime.now());
        return AuthResponse.of("access.token", "refresh.token", 86400000L, user);
    }

    @Test
    @DisplayName("POST /auth/register - 201 avec données valides")
    void register_ValidRequest_Returns201() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Amira", "Soussi", "amira@test.ma", "Test@1234", "+212699887766");

        when(authService.register(any())).thenReturn(buildAuthResponse("amira@test.ma"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access.token"))
                .andExpect(jsonPath("$.data.user.email").value("amira@test.ma"));
    }

    @Test
    @DisplayName("POST /auth/register - 400 avec données invalides (email malformé)")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Amira", "Soussi", "not-an-email", "Test@1234", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /auth/register - 400 avec mot de passe faible")
    void register_WeakPassword_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Amira", "Soussi", "amira@test.ma", "weakpassword", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/login - 200 avec identifiants valides")
    void login_ValidCredentials_Returns200() throws Exception {
        LoginRequest request = new LoginRequest("amira@test.ma", "Test@1234");

        when(authService.login(any())).thenReturn(buildAuthResponse("amira@test.ma"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /auth/login - 400 si champs manquants")
    void login_MissingFields_Returns400() throws Exception {
        String body = """
                {"email": "", "password": ""}
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
