package com.riad.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReservationRequest(

        @NotNull(message = "L'identifiant de la chambre est obligatoire")
        @Positive(message = "L'identifiant de la chambre doit être positif")
        Long roomId,

        @NotNull(message = "La date d'arrivée est obligatoire")
        @Future(message = "La date d'arrivée doit être dans le futur")
        LocalDate checkIn,

        @NotNull(message = "La date de départ est obligatoire")
        LocalDate checkOut,

        @NotNull(message = "Le nombre de personnes est obligatoire")
        @Min(value = 1, message = "Il faut au moins une personne")
        @Max(value = 10, message = "Maximum 10 personnes par réservation")
        Integer numberOfGuests,

        @Size(max = 500, message = "Les demandes spéciales ne doivent pas dépasser 500 caractères")
        String specialRequests
) {}
