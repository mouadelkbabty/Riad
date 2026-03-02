package com.riad.controller;

import com.riad.domain.enums.RoomType;
import com.riad.dto.request.RoomRequest;
import com.riad.dto.response.ApiResponse;
import com.riad.dto.response.PageResponse;
import com.riad.dto.response.RoomResponse;
import com.riad.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Chambres", description = "Gestion des chambres du Riad")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Lister toutes les chambres disponibles (paginé)")
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "pricePerNight") String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getAllRooms(page, size, sortBy)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une chambre")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
    }

    @GetMapping("/available")
    @Operation(summary = "Rechercher les chambres disponibles pour des dates données")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") Integer guests) {
        return ResponseEntity.ok(ApiResponse.success(
                roomService.searchAvailableRooms(checkIn, checkOut, guests)));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filtrer les chambres par critères")
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> filterRooms(
            @RequestParam(required = false) RoomType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                roomService.filterRooms(type, minPrice, maxPrice, minCapacity, page, size)));
    }

    // ========== ADMIN ==========

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Créer une nouvelle chambre")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request) {
        RoomResponse created = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Chambre créée avec succès"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Mettre à jour une chambre")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                roomService.updateRoom(id, request), "Chambre mise à jour avec succès"));
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Activer/désactiver la disponibilité d'une chambre")
    public ResponseEntity<ApiResponse<Void>> toggleAvailability(@PathVariable Long id) {
        roomService.toggleRoomAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Disponibilité mise à jour"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "[ADMIN] Supprimer une chambre")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Chambre supprimée avec succès"));
    }
}
