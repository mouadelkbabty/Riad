package com.riad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChatbotMessageRequest(

        @NotBlank(message = "Le message ne peut pas être vide")
        @Size(min = 1, max = 500, message = "Le message doit contenir entre 1 et 500 caractères")
        String message,

        @Pattern(regexp = "^(fr|en|ar|es)$", message = "Langue non supportée")
        String language
) {}
