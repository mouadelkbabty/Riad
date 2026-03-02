package com.riad.service;

import com.riad.config.JwtProperties;
import com.riad.domain.entity.User;
import com.riad.domain.enums.Role;
import com.riad.dto.request.LoginRequest;
import com.riad.dto.request.RegisterRequest;
import com.riad.dto.response.AuthResponse;
import com.riad.exception.EmailAlreadyExistsException;
import com.riad.repository.UserRepository;
import com.riad.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Tests Unitaires")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest(
                "Youssef", "El Amrani",
                "youssef@test.ma",
                "Test@1234",
                "+212612345678");

        loginRequest = new LoginRequest("youssef@test.ma", "Test@1234");

        testUser = User.builder()
                .id(1L)
                .firstName("Youssef")
                .lastName("El Amrani")
                .email("youssef@test.ma")
                .password("$2a$12$encoded")
                .role(Role.GUEST)
                .enabled(true)
                .build();
    }

    // ══════════ REGISTER ══════════

    @Test
    @DisplayName("register() - Succès avec données valides")
    void register_WithValidData_ReturnsAuthResponse() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$encoded");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any())).thenReturn("access.token.jwt");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh.token.jwt");
        when(jwtService.getAccessTokenExpiration()).thenReturn(86400000L);
        doNothing().when(emailService).sendWelcomeEmail(any());

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access.token.jwt");
        assertThat(response.refreshToken()).isEqualTo("refresh.token.jwt");
        assertThat(response.user()).isNotNull();
        assertThat(response.user().email()).isEqualTo("youssef@test.ma");

        verify(userRepository, times(2)).save(any(User.class));
        verify(emailService, times(1)).sendWelcomeEmail(any());
    }

    @Test
    @DisplayName("register() - Exception si email déjà utilisé")
    void register_WithDuplicateEmail_ThrowsEmailAlreadyExistsException() {
        when(userRepository.existsByEmail("youssef@test.ma")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("youssef@test.ma");

        verify(userRepository, never()).save(any());
    }

    // ══════════ LOGIN ══════════

    @Test
    @DisplayName("login() - Succès avec identifiants valides")
    void login_WithValidCredentials_ReturnsAuthResponse() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByEmail("youssef@test.ma")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any())).thenReturn("access.token.jwt");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh.token.jwt");
        when(jwtService.getAccessTokenExpiration()).thenReturn(86400000L);
        when(userRepository.save(any())).thenReturn(testUser);

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.accessToken()).isEqualTo("access.token.jwt");
        assertThat(response.user().email()).isEqualTo("youssef@test.ma");
    }

    @Test
    @DisplayName("login() - Exception avec mauvais mot de passe")
    void login_WithBadCredentials_ThrowsBadCredentialsException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ══════════ LOGOUT ══════════

    @Test
    @DisplayName("logout() - Efface le refresh token")
    void logout_ClearsRefreshToken() {
        testUser.setRefreshToken("some.refresh.token");
        when(userRepository.findByEmail("youssef@test.ma")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        authService.logout("youssef@test.ma");

        assertThat(testUser.getRefreshToken()).isNull();
        verify(userRepository).save(testUser);
    }
}
