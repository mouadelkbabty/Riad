package com.riad.controller;

import com.riad.domain.enums.ReservationStatus;
import com.riad.dto.request.CancelReservationRequest;
import com.riad.dto.request.GuestReservationRequest;
import com.riad.dto.request.ReservationRequest;
import com.riad.dto.response.ApiResponse;
import com.riad.dto.response.PageResponse;
import com.riad.dto.response.ReservationResponse;
import com.riad.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Réservations", description = "Gestion des réservations")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/guest-request")
    @Operation(summary = "Envoyer une demande de réservation (visiteur sans compte)")
    public ResponseEntity<ApiResponse<Void>> sendGuestReservationRequest(
            @Valid @RequestBody GuestReservationRequest request) {
        reservationService.handleGuestReservationRequest(request);
        return ResponseEntity.ok(ApiResponse.success(null,
                "Votre demande de réservation a été envoyée. Nous vous contacterons bientôt."));
    }

    @PostMapping
    @Operation(summary = "Créer une réservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReservationResponse response = reservationService.createReservation(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response,
                        "Réservation créée avec succès. Numéro: " + response.reservationNumber()));
    }

    @GetMapping("/my")
    @Operation(summary = "Mes réservations")
    public ResponseEntity<ApiResponse<PageResponse<ReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getMyReservations(userDetails.getUsername(), page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une réservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationById(id, userDetails.getUsername())));
    }

    @GetMapping("/number/{reservationNumber}")
    @Operation(summary = "Récupérer une réservation par son numéro")
    public ResponseEntity<ApiResponse<ReservationResponse>> getByReservationNumber(
            @PathVariable String reservationNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationByNumber(reservationNumber)));
    }

    @GetMapping("/rooms/{roomId}/occupied-dates")
    @Operation(summary = "Obtenir les dates occupées d'une chambre")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getOccupiedDates(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getOccupiedDates(roomId)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Annuler une réservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable Long id,
            @RequestBody(required = false) CancelReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReservationResponse response = reservationService.cancelReservation(
                id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Réservation annulée avec succès"));
    }

    // ========== ADMIN ==========

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[ADMIN] Toutes les réservations")
    public ResponseEntity<ApiResponse<PageResponse<ReservationResponse>>> getAllReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getAllReservations(status, page, size)));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[ADMIN] Confirmer une réservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> confirmReservation(@PathVariable Long id) {
        ReservationResponse response = reservationService.confirmReservation(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Réservation confirmée avec succès"));
    }
}
