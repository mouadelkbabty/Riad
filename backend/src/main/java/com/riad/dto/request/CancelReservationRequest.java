package com.riad.dto.request;

import jakarta.validation.constraints.Size;

public record CancelReservationRequest(

        @Size(max = 500, message = "La raison ne doit pas dépasser 500 caractères")
        String reason
) {}
