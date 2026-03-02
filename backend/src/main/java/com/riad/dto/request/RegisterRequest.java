package com.riad.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(min = 2, max = 100, message = "Le prénom doit avoir entre 2 et 100 caractères")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100, message = "Le nom doit avoir entre 2 et 100 caractères")
        String lastName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit avoir au moins 8 caractères")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
        )
        String password,

        @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Numéro de téléphone invalide")
        String phone
) {}
