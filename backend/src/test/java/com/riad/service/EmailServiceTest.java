package com.riad.service;

import com.riad.domain.entity.Reservation;
import com.riad.domain.entity.Room;
import com.riad.domain.entity.User;
import com.riad.domain.enums.ReservationStatus;
import com.riad.domain.enums.Role;
import com.riad.domain.enums.RoomType;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.IContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService - Tests Unitaires")
class EmailServiceTest {

    @Mock private JavaMailSender mailSender;
    @Mock private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    private User testUser;
    private Reservation testReservation;

    @BeforeEach
    void setUp() throws Exception {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@riad.ma");
        ReflectionTestUtils.setField(emailService, "fromName", "Le Riad");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:3000");

        testUser = User.builder()
                .id(1L).firstName("Ahmed").lastName("Alami")
                .email("ahmed@test.ma").role(Role.ADMIN).enabled(true).build();

        Room testRoom = Room.builder()
                .id(1L).name("Suite Andalouse").type(RoomType.SUITE)
                .description("desc").descriptionFr("desc fr").descriptionAr("وصف")
                .pricePerNight(BigDecimal.valueOf(1800)).capacity(4).surface(60)
                .available(true).build();

        testReservation = Reservation.builder()
                .id(1L).reservationNumber("RIAD-TEST001")
                .user(testUser).room(testRoom)
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(14))
                .numberOfGuests(2).totalPrice(BigDecimal.valueOf(7200))
                .status(ReservationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        MimeMessage mimeMessage = mock(MimeMessage.class);
        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        lenient().when(templateEngine.process(anyString(), any(IContext.class))).thenReturn("<html>email</html>");
    }

    @Test
    @DisplayName("sendWelcomeEmail() - Envoie l'email de bienvenue")
    void sendWelcomeEmail_SendsEmailSuccessfully() {
        emailService.sendWelcomeEmail(testUser);

        verify(templateEngine).process(eq("email/welcome"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendReservationConfirmationEmail() - Envoie l'email de confirmation")
    void sendReservationConfirmationEmail_SendsEmailSuccessfully() {
        emailService.sendReservationConfirmationEmail(testReservation);

        verify(templateEngine).process(eq("email/reservation-confirmation"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendReservationStatusUpdateEmail() - Envoie l'email de confirmation de réservation")
    void sendReservationStatusUpdate_WhenConfirmed_SendsConfirmedEmail() {
        testReservation.setStatus(ReservationStatus.CONFIRMED);

        emailService.sendReservationStatusUpdateEmail(testReservation);

        verify(templateEngine).process(eq("email/reservation-confirmed"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendReservationStatusUpdateEmail() - Envoie l'email d'annulation")
    void sendReservationStatusUpdate_WhenCancelled_SendsCancelledEmail() {
        testReservation.setStatus(ReservationStatus.CANCELLED);

        emailService.sendReservationStatusUpdateEmail(testReservation);

        verify(templateEngine).process(eq("email/reservation-cancelled"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendReservationStatusUpdateEmail() - Envoie l'email de mise à jour par défaut")
    void sendReservationStatusUpdate_WhenCompleted_SendsUpdateEmail() {
        testReservation.setStatus(ReservationStatus.COMPLETED);

        emailService.sendReservationStatusUpdateEmail(testReservation);

        verify(templateEngine).process(eq("email/reservation-update"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendGuestReservationRequestEmail() - Envoie l'email de demande de réservation")
    void sendGuestReservationRequestEmail_SendsEmailSuccessfully() {
        emailService.sendGuestReservationRequestEmail(
                "admin@riad.ma", "Marie Dupont", "marie@test.fr",
                "+33612345678", 2,
                LocalDate.now().plusDays(5), LocalDate.now().plusDays(9),
                "Chambre Jasmin", "Vue sur patio svp");

        verify(templateEngine).process(eq("email/guest-reservation-request"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendPasswordResetEmail() - Envoie l'email de réinitialisation")
    void sendPasswordResetEmail_SendsEmailSuccessfully() {
        emailService.sendPasswordResetEmail(testUser, "reset-token-xyz");

        verify(templateEngine).process(eq("email/password-reset"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendPasswordChangedEmail() - Envoie l'email de confirmation de changement")
    void sendPasswordChangedEmail_SendsEmailSuccessfully() {
        emailService.sendPasswordChangedEmail(testUser);

        verify(templateEngine).process(eq("email/password-changed"), any(IContext.class));
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendWelcomeEmail() - Gère les erreurs sans exception propagée")
    void sendWelcomeEmail_WhenMailSenderFails_DoesNotThrowException() {
        lenient().when(templateEngine.process(anyString(), any(IContext.class)))
                .thenThrow(new RuntimeException("Template error"));

        assertThatCode(() -> emailService.sendWelcomeEmail(testUser))
                .doesNotThrowAnyException();
    }

    private static org.assertj.core.api.AbstractThrowableAssert<?, ? extends Throwable>
            assertThatCode(org.assertj.core.api.ThrowableAssert.ThrowingCallable callable) {
        return org.assertj.core.api.Assertions.assertThatCode(callable);
    }
}
