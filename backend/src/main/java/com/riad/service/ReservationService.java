package com.riad.service;

import com.riad.domain.entity.Reservation;
import com.riad.domain.entity.Room;
import com.riad.domain.entity.User;
import com.riad.domain.enums.ReservationStatus;
import com.riad.dto.request.CancelReservationRequest;
import com.riad.dto.request.ReservationRequest;
import com.riad.dto.response.PageResponse;
import com.riad.dto.response.ReservationResponse;
import com.riad.dto.response.UserResponse;
import com.riad.exception.InvalidReservationException;
import com.riad.exception.ReservationConflictException;
import com.riad.exception.ResourceNotFoundException;
import com.riad.repository.ReservationRepository;
import com.riad.repository.RoomRepository;
import com.riad.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationService {

    private static final int MAX_ADVANCE_BOOKING_DAYS = 365;
    private static final int MIN_STAY_NIGHTS = 1;

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ReservationResponse createReservation(ReservationRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", request.roomId()));

        validateReservationRequest(request, room);

        long conflictCount = reservationRepository.countConflicts(
                room.getId(), request.checkIn(), request.checkOut(), null);
        if (conflictCount > 0) {
            throw new ReservationConflictException(
                    "La chambre '" + room.getName() + "' n'est pas disponible pour les dates sélectionnées. "
                    + "Veuillez choisir d'autres dates.");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Reservation reservation = Reservation.builder()
                .reservationNumber(generateReservationNumber())
                .user(user)
                .room(room)
                .checkIn(request.checkIn())
                .checkOut(request.checkOut())
                .numberOfGuests(request.numberOfGuests())
                .totalPrice(totalPrice)
                .specialRequests(request.specialRequests())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Réservation créée: {} pour {} (chambre: {})",
                saved.getReservationNumber(), user.getEmail(), room.getName());

        emailService.sendReservationConfirmationEmail(saved);

        return toReservationResponse(saved);
    }

    public void handleGuestReservationRequest(com.riad.dto.request.GuestReservationRequest request) {
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", request.roomId()));

        if (!room.isAvailable()) {
            throw new InvalidReservationException("La chambre '" + room.getName() + "' n'est pas disponible à la réservation");
        }

        if (!request.checkIn().isBefore(request.checkOut())) {
            throw new InvalidReservationException("La date d'arrivée doit être strictement avant la date de départ");
        }

        if (request.checkIn().isBefore(LocalDate.now())) {
            throw new InvalidReservationException("La date d'arrivée ne peut pas être dans le passé");
        }

        if (request.numberOfGuests() > room.getCapacity()) {
            throw new InvalidReservationException(
                    "La chambre '" + room.getName() + "' a une capacité maximale de " + room.getCapacity() + " personnes");
        }

        // Find admin email to send notification
        String adminEmail = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN"))
                .map(User::getEmail)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun administrateur trouvé"));

        emailService.sendGuestReservationRequestEmail(
                adminEmail,
                request.fullName(),
                request.email(),
                request.phone(),
                request.numberOfGuests(),
                request.checkIn(),
                request.checkOut(),
                room.getName(),
                request.message()
        );

        log.info("Demande de réservation envoyée par {} pour la chambre {}",
                request.email(), room.getName());
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id, String userEmail) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        // Un utilisateur ne peut voir que ses propres réservations (sauf admin)
        if (!reservation.getUser().getId().equals(user.getId()) &&
                !user.getRole().name().equals("ADMIN")) {
            throw new ResourceNotFoundException("Réservation", id);
        }

        return toReservationResponse(reservation);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationByNumber(String reservationNumber) {
        return reservationRepository.findByReservationNumber(reservationNumber)
                .map(this::toReservationResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "numéro", reservationNumber));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getMyReservations(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.from(
                reservationRepository.findByUserId(user.getId(), pageable)
                        .map(this::toReservationResponse));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getAllReservations(ReservationStatus status,
                                                                 int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            return PageResponse.from(
                    reservationRepository.findByStatus(status, pageable)
                            .map(this::toReservationResponse));
        }
        return PageResponse.from(
                reservationRepository.findAll(pageable).map(this::toReservationResponse));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ReservationResponse confirmReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", id));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new InvalidReservationException(
                    "Seules les réservations en attente peuvent être confirmées. " +
                    "Statut actuel: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmedAt(LocalDateTime.now());
        Reservation updated = reservationRepository.save(reservation);

        emailService.sendReservationStatusUpdateEmail(updated);
        log.info("Réservation confirmée: {}", updated.getReservationNumber());

        return toReservationResponse(updated);
    }

    public ReservationResponse cancelReservation(Long id, CancelReservationRequest request,
                                                  String userEmail) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = reservation.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new ResourceNotFoundException("Réservation", id);
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidReservationException(
                    "Cette réservation ne peut plus être annulée. Statut: " + reservation.getStatus());
        }

        // Vérification politique d'annulation (48h avant check-in)
        if (!isAdmin && LocalDate.now().plusDays(2).isAfter(reservation.getCheckIn())) {
            throw new InvalidReservationException(
                    "L'annulation n'est plus possible à moins de 48h de l'arrivée. " +
                    "Veuillez contacter le riad directement.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancellationReason(request != null ? request.reason() : null);
        Reservation updated = reservationRepository.save(reservation);

        emailService.sendReservationStatusUpdateEmail(updated);
        log.info("Réservation annulée: {} par {}", updated.getReservationNumber(), userEmail);

        return toReservationResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getOccupiedDates(Long roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre", roomId));

        return reservationRepository.findOccupiedDateRanges(roomId, LocalDate.now())
                .stream()
                .flatMap(row -> {
                    LocalDate start = (LocalDate) row[0];
                    LocalDate end = (LocalDate) row[1];
                    return start.datesUntil(end);
                })
                .toList();
    }

    // Marque automatiquement les réservations confirmées passées comme "COMPLETED"
    @Scheduled(cron = "0 0 2 * * *") // Chaque nuit à 2h
    public void markCompletedReservations() {
        reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .filter(r -> r.getCheckOut().isBefore(LocalDate.now()))
                .forEach(r -> {
                    r.setStatus(ReservationStatus.COMPLETED);
                    reservationRepository.save(r);
                    log.debug("Réservation marquée COMPLETED: {}", r.getReservationNumber());
                });
    }

    private void validateReservationRequest(ReservationRequest request, Room room) {
        if (!request.checkIn().isBefore(request.checkOut())) {
            throw new InvalidReservationException(
                    "La date d'arrivée doit être strictement avant la date de départ");
        }

        if (request.checkIn().isBefore(LocalDate.now())) {
            throw new InvalidReservationException("La date d'arrivée ne peut pas être dans le passé");
        }

        if (request.checkIn().isAfter(LocalDate.now().plusDays(MAX_ADVANCE_BOOKING_DAYS))) {
            throw new InvalidReservationException(
                    "Les réservations ne peuvent pas être faites plus d'un an à l'avance");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        if (nights < MIN_STAY_NIGHTS) {
            throw new InvalidReservationException("La durée minimum de séjour est de " + MIN_STAY_NIGHTS + " nuit(s)");
        }

        if (!room.isAvailable()) {
            throw new InvalidReservationException("La chambre '" + room.getName() + "' n'est pas disponible à la réservation");
        }

        if (request.numberOfGuests() > room.getCapacity()) {
            throw new InvalidReservationException(
                    "La chambre '" + room.getName() + "' a une capacité maximale de " + room.getCapacity() + " personnes");
        }
    }

    private String generateReservationNumber() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        return "RIAD-" + uuid;
    }

    public ReservationResponse toReservationResponse(Reservation r) {
        User user = r.getUser();
        UserResponse userResponse = new UserResponse(
                user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhone(), user.getRole(),
                user.isEmailVerified(), user.getCreatedAt());

        return new ReservationResponse(
                r.getId(),
                r.getReservationNumber(),
                r.getRoom().getId(),
                r.getRoom().getName(),
                r.getRoom().getType().getLabel(),
                r.getCheckIn(),
                r.getCheckOut(),
                r.getNumberOfNights(),
                r.getNumberOfGuests(),
                r.getTotalPrice(),
                r.getStatus(),
                r.getSpecialRequests(),
                r.getCreatedAt(),
                r.getConfirmedAt(),
                r.getCancelledAt(),
                r.getCancellationReason(),
                userResponse);
    }
}
