package com.riad.service;

import com.riad.domain.entity.Reservation;
import com.riad.domain.entity.Room;
import com.riad.domain.entity.User;
import com.riad.domain.enums.ReservationStatus;
import com.riad.domain.enums.Role;
import com.riad.domain.enums.RoomType;
import com.riad.dto.request.CancelReservationRequest;
import com.riad.dto.request.ReservationRequest;
import com.riad.dto.response.ReservationResponse;
import com.riad.exception.InvalidReservationException;
import com.riad.exception.ReservationConflictException;
import com.riad.exception.ResourceNotFoundException;
import com.riad.repository.ReservationRepository;
import com.riad.repository.RoomRepository;
import com.riad.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService - Tests Unitaires")
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private Room testRoom;
    private ReservationRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).firstName("Aicha").lastName("Benali")
                .email("aicha@test.ma").role(Role.GUEST).enabled(true).build();

        testRoom = Room.builder()
                .id(1L).name("Chambre Jasmin").type(RoomType.STANDARD)
                .pricePerNight(BigDecimal.valueOf(800)).capacity(2)
                .surface(25).available(true).build();

        validRequest = new ReservationRequest(
                1L,
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(14),
                2,
                "Vue sur patio svp");
    }

    // ══════════ CREATE ══════════

    @Test
    @DisplayName("createReservation() - Succès: chambre disponible")
    void createReservation_WithAvailableRoom_Succeeds() {
        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(reservationRepository.countConflicts(anyLong(), any(), any(), any())).thenReturn(0L);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> {
            Reservation r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });
        doNothing().when(emailService).sendReservationConfirmationEmail(any());

        ReservationResponse response = reservationService.createReservation(validRequest, "aicha@test.ma");

        assertThat(response).isNotNull();
        assertThat(response.roomId()).isEqualTo(1L);
        assertThat(response.numberOfNights()).isEqualTo(4);
        assertThat(response.totalPrice()).isEqualByComparingTo(BigDecimal.valueOf(3200));
        assertThat(response.status()).isEqualTo(ReservationStatus.PENDING);
        verify(emailService).sendReservationConfirmationEmail(any());
    }

    @Test
    @DisplayName("createReservation() - Exception: chambre déjà réservée")
    void createReservation_WithConflict_ThrowsReservationConflictException() {
        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(reservationRepository.countConflicts(anyLong(), any(), any(), any())).thenReturn(1L);

        assertThatThrownBy(() -> reservationService.createReservation(validRequest, "aicha@test.ma"))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessageContaining("Chambre Jasmin");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("createReservation() - Exception: date d'arrivée dans le passé")
    void createReservation_WithPastCheckIn_ThrowsInvalidReservationException() {
        ReservationRequest pastRequest = new ReservationRequest(
                1L,
                LocalDate.now().minusDays(1), // passé
                LocalDate.now().plusDays(2),
                2, null);

        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> reservationService.createReservation(pastRequest, "aicha@test.ma"))
                .isInstanceOf(InvalidReservationException.class)
                .hasMessageContaining("passé");
    }

    @Test
    @DisplayName("createReservation() - Exception: check-in = check-out")
    void createReservation_WhenCheckInEqualsCheckOut_ThrowsInvalidReservationException() {
        LocalDate sameDate = LocalDate.now().plusDays(5);
        ReservationRequest r = new ReservationRequest(1L, sameDate, sameDate, 2, null);

        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> reservationService.createReservation(r, "aicha@test.ma"))
                .isInstanceOf(InvalidReservationException.class);
    }

    @Test
    @DisplayName("createReservation() - Exception: trop de personnes")
    void createReservation_WithTooManyGuests_ThrowsInvalidReservationException() {
        ReservationRequest r = new ReservationRequest(
                1L, LocalDate.now().plusDays(5), LocalDate.now().plusDays(9), 10, null); // capacity = 2

        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> reservationService.createReservation(r, "aicha@test.ma"))
                .isInstanceOf(InvalidReservationException.class)
                .hasMessageContaining("capacité");
    }

    @Test
    @DisplayName("createReservation() - Exception: chambre non disponible")
    void createReservation_WithUnavailableRoom_ThrowsInvalidReservationException() {
        testRoom.setAvailable(false);
        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        assertThatThrownBy(() -> reservationService.createReservation(validRequest, "aicha@test.ma"))
                .isInstanceOf(InvalidReservationException.class)
                .hasMessageContaining("n'est pas disponible");
    }

    // ══════════ CANCEL ══════════

    @Test
    @DisplayName("cancelReservation() - Succès: annulation autorisée")
    void cancelReservation_WithOwner_Succeeds() {
        Reservation reservation = Reservation.builder()
                .id(5L).reservationNumber("RIAD-TEST")
                .user(testUser).room(testRoom)
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(14))
                .numberOfGuests(2).totalPrice(BigDecimal.valueOf(3200))
                .status(ReservationStatus.PENDING).build();

        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));
        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendReservationStatusUpdateEmail(any());

        ReservationResponse response = reservationService.cancelReservation(
                5L, new CancelReservationRequest("Voyage annulé"), "aicha@test.ma");

        assertThat(response.status()).isEqualTo(ReservationStatus.CANCELLED);
        assertThat(response.cancellationReason()).isEqualTo("Voyage annulé");
    }

    @Test
    @DisplayName("cancelReservation() - Exception: moins de 48h avant arrivée")
    void cancelReservation_Within48Hours_ThrowsInvalidReservationException() {
        Reservation reservation = Reservation.builder()
                .id(5L).reservationNumber("RIAD-TEST")
                .user(testUser).room(testRoom)
                .checkIn(LocalDate.now().plusDays(1)) // Dans 1 jour -> moins de 48h
                .checkOut(LocalDate.now().plusDays(5))
                .numberOfGuests(2).totalPrice(BigDecimal.valueOf(3200))
                .status(ReservationStatus.CONFIRMED).build();

        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));
        when(userRepository.findByEmail("aicha@test.ma")).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> reservationService.cancelReservation(5L, null, "aicha@test.ma"))
                .isInstanceOf(InvalidReservationException.class)
                .hasMessageContaining("48h");
    }

    // ══════════ CONFIRM ══════════

    @Test
    @DisplayName("confirmReservation() - Exception: déjà confirmée")
    void confirmReservation_AlreadyConfirmed_ThrowsInvalidReservationException() {
        Reservation reservation = Reservation.builder()
                .id(1L).reservationNumber("RIAD-001")
                .user(testUser).room(testRoom)
                .checkIn(LocalDate.now().plusDays(5))
                .checkOut(LocalDate.now().plusDays(9))
                .status(ReservationStatus.CONFIRMED).build();

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.confirmReservation(1L))
                .isInstanceOf(InvalidReservationException.class);
    }
}
