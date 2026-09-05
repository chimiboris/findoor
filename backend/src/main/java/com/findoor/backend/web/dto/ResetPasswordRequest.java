package com.findoor.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "L'email ou le téléphone est obligatoire") String identifiant,
        @NotBlank(message = "Le code est obligatoire") String code,
        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
                @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
                String nouveauMotDePasse) {}
