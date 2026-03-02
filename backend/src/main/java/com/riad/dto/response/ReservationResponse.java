package com.riad.dto.response;

import com.riad.domain.enums.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        String reservationNumber,
        Long roomId,
        String roomName,
        String roomType,
        LocalDate checkIn,
        LocalDate checkOut,
        long numberOfNights,
        Integer numberOfGuests,
        BigDecimal totalPrice,
        ReservationStatus status,
        String specialRequests,
        LocalDateTime createdAt,
        LocalDateTime confirmedAt,
        LocalDateTime cancelledAt,
        String cancellationReason,
        UserResponse user
) {}
