package com.findoor.backend.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** Choix de formule d'abonnement + moyen de paiement ("Choisir une formule", phase 4). */
public record PaiementCreateRequest(
        @NotNull @Pattern(regexp = "DEUX_MOIS|QUATRE_MOIS|SIX_MOIS|HUIT_MOIS|DIX_MOIS|DOUZE_MOIS", message = "Formule invalide") String formule,
        @NotNull @Pattern(regexp = "MTN_MOMO|ORANGE_MONEY|CARTE", message = "Moyen de paiement invalide") String moyen) {}
