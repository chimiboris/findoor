package com.findoor.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ForgotPasswordRequest(
        @NotBlank(message = "L'email ou le téléphone est obligatoire") String identifiant,
        @NotBlank @Pattern(regexp = "EMAIL|SMS", message = "Canal invalide") String canal) {}
