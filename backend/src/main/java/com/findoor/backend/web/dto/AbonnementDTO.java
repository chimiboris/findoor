package com.findoor.backend.web.dto;

import java.time.LocalDate;

/** État d'abonnement du propriétaire connecté (phase 4) — voir PaymentService.monAbonnement. */
public record AbonnementDTO(LocalDate dateAccesExpire, boolean actif) {}
