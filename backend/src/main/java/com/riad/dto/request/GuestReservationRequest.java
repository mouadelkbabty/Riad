package com.riad.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record GuestReservationRequest(

        @NotNull(message = "L'identifiant de la chambre est obligatoire")
        @Positive(message = "L'identifiant de la chambre doit être positif")
        Long roomId,

        @NotBlank(message = "Le nom complet est obligatoire")
        @Size(max = 100, message = "Le nom complet ne doit pas dépasser 100 caractères")
        String fullName,

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "L'adresse email n'est pas valide")
        @Size(max = 150, message = "L'email ne doit pas dépasser 150 caractères")
        String email,

        @NotBlank(message = "Le numéro de téléphone est obligatoire")
        @Size(max = 20, message = "Le numéro de téléphone ne doit pas dépasser 20 caractères")
        String phone,

        @NotNull(message = "Le nombre de personnes est obligatoire")
        @Min(value = 1, message = "Il faut au moins une personne")
        @Max(value = 10, message = "Maximum 10 personnes par réservation")
        Integer numberOfGuests,

        @NotNull(message = "La date d'arrivée est obligatoire")
        @FutureOrPresent(message = "La date d'arrivée doit être aujourd'hui ou dans le futur")
        LocalDate checkIn,

        @NotNull(message = "La date de départ est obligatoire")
        LocalDate checkOut,

        @Size(max = 500, message = "Le message ne doit pas dépasser 500 caractères")
        String message
) {}
