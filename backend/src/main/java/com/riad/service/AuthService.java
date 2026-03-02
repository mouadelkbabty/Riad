package com.riad.service;

import com.riad.domain.entity.User;
import com.riad.dto.request.*;
import com.riad.dto.response.AuthResponse;
import com.riad.dto.response.UserResponse;
import com.riad.exception.EmailAlreadyExistsException;
import com.riad.exception.ResourceNotFoundException;
import com.riad.repository.UserRepository;
import com.riad.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .build();

        User savedUser = userRepository.save(user);
        log.info("Nouvel utilisateur enregistré: {}", savedUser.getEmail());

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        emailService.sendWelcomeEmail(savedUser);

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpiration(),
                toUserResponse(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("Connexion réussie pour: {}", user.getEmail());
        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpiration(),
                toUserResponse(user));
    }

    public AuthResponse refreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token invalide"));

        if (jwtService.isTokenExpired(refreshToken)) {
            user.setRefreshToken(null);
            userRepository.save(user);
            throw new ResourceNotFoundException("Refresh token expiré, veuillez vous reconnecter");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken,
                jwtService.getAccessTokenExpiration(),
                toUserResponse(user));
    }

    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
            log.info("Déconnexion de: {}", email);
        });
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user, token);
            log.info("Token de réinitialisation envoyé à: {}", user.getEmail());
        });
        // Toujours retourner OK pour ne pas exposer l'existence des emails
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> new ResourceNotFoundException("Token de réinitialisation invalide"));

        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Token de réinitialisation expiré");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setRefreshToken(null); // Invalider toutes les sessions
        userRepository.save(user);

        emailService.sendPasswordChangedEmail(user);
        log.info("Mot de passe réinitialisé pour: {}", user.getEmail());
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isEmailVerified(),
                user.getCreatedAt());
    }
}
