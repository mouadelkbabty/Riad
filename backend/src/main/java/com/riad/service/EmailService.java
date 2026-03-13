package com.riad.service;

import com.riad.domain.entity.Reservation;
import com.riad.domain.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;
import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${application.mail.from}")
    private String fromEmail;

    @Value("${application.mail.from-name}")
    private String fromName;

    @Value("${application.frontend-url}")
    private String frontendUrl;

    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("user", user);
            context.setVariable("frontendUrl", frontendUrl);

            String html = templateEngine.process("email/welcome", context);
            sendEmail(user.getEmail(), "Bienvenue au Riad - Votre compte est créé", html);
            log.info("Email de bienvenue envoyé à: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de bienvenue à {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendReservationConfirmationEmail(Reservation reservation) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("reservation", reservation);
            context.setVariable("user", reservation.getUser());
            context.setVariable("room", reservation.getRoom());
            context.setVariable("frontendUrl", frontendUrl);

            String html = templateEngine.process("email/reservation-confirmation", context);
            sendEmail(
                    reservation.getUser().getEmail(),
                    "Demande de réservation reçue - " + reservation.getReservationNumber(),
                    html);
            log.info("Email de confirmation envoyé pour réservation: {}", reservation.getReservationNumber());
        } catch (Exception e) {
            log.error("Erreur email réservation {}: {}", reservation.getReservationNumber(), e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendReservationStatusUpdateEmail(Reservation reservation) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("reservation", reservation);
            context.setVariable("user", reservation.getUser());
            context.setVariable("room", reservation.getRoom());
            context.setVariable("frontendUrl", frontendUrl);

            String templateName = switch (reservation.getStatus()) {
                case CONFIRMED -> "email/reservation-confirmed";
                case CANCELLED -> "email/reservation-cancelled";
                default -> "email/reservation-update";
            };

            String subject = switch (reservation.getStatus()) {
                case CONFIRMED -> "Réservation confirmée - " + reservation.getReservationNumber();
                case CANCELLED -> "Réservation annulée - " + reservation.getReservationNumber();
                default -> "Mise à jour de votre réservation - " + reservation.getReservationNumber();
            };

            String html = templateEngine.process(templateName, context);
            sendEmail(reservation.getUser().getEmail(), subject, html);
        } catch (Exception e) {
            log.error("Erreur email mise à jour réservation {}: {}", reservation.getReservationNumber(),
                    e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendGuestReservationRequestEmail(String adminEmail,
                                                  String fullName, String email, String phone,
                                                  int numberOfGuests,
                                                  java.time.LocalDate checkIn, java.time.LocalDate checkOut,
                                                  String roomName, String message) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("fullName", fullName);
            context.setVariable("email", email);
            context.setVariable("phone", phone);
            context.setVariable("numberOfGuests", numberOfGuests);
            context.setVariable("checkIn", checkIn);
            context.setVariable("checkOut", checkOut);
            context.setVariable("roomName", roomName);
            context.setVariable("message", message);
            context.setVariable("frontendUrl", frontendUrl);

            String html = templateEngine.process("email/guest-reservation-request", context);
            sendEmail(adminEmail, "Nouvelle demande de réservation — " + fullName, html);
            log.info("Email de demande de réservation envoyé à l'admin pour le client: {}", email);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de demande de réservation pour {}: {}", email, e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(User user, String token) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("user", user);
            context.setVariable("resetLink", frontendUrl + "/reset-password?token=" + token);
            context.setVariable("expiryHours", 1);

            String html = templateEngine.process("email/password-reset", context);
            sendEmail(user.getEmail(), "Réinitialisation de votre mot de passe - Riad", html);
        } catch (Exception e) {
            log.error("Erreur email réinitialisation mot de passe pour {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    public void sendPasswordChangedEmail(User user) {
        try {
            Context context = new Context(Locale.FRENCH);
            context.setVariable("user", user);

            String html = templateEngine.process("email/password-changed", context);
            sendEmail(user.getEmail(), "Mot de passe modifié - Riad", html);
        } catch (Exception e) {
            log.error("Erreur email confirmation changement mot de passe pour {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            throw new MessagingException("Invalid encoding for fromName", e);
        }
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
