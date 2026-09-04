package com.findoor.backend.web.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Le jeton de rafraîchissement est obligatoire") String refreshToken) {}
