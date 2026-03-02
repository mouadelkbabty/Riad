package com.riad.dto.request;

import com.riad.domain.enums.RoomType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record RoomRequest(

        @NotBlank(message = "Le nom de la chambre est obligatoire")
        @Size(min = 3, max = 100, message = "Le nom doit avoir entre 3 et 100 caractères")
        String name,

        @NotBlank(message = "La description (EN) est obligatoire")
        String description,

        @NotBlank(message = "La description (FR) est obligatoire")
        String descriptionFr,

        @NotBlank(message = "La description (AR) est obligatoire")
        String descriptionAr,

        @NotNull(message = "Le type de chambre est obligatoire")
        RoomType type,

        @NotNull(message = "Le prix par nuit est obligatoire")
        @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
        @Digits(integer = 8, fraction = 2, message = "Format de prix invalide")
        BigDecimal pricePerNight,

        @NotNull(message = "La capacité est obligatoire")
        @Min(value = 1, message = "La capacité minimum est 1")
        @Max(value = 20, message = "La capacité maximum est 20")
        Integer capacity,

        @NotNull(message = "La surface est obligatoire")
        @Min(value = 10, message = "La surface minimum est 10m²")
        Integer surface,

        List<String> amenities
) {}
