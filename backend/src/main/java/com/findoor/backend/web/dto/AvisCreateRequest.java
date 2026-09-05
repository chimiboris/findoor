package com.findoor.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Dépôt d'un avis (fiche annonce, public — aucune authentification requise). */
public record AvisCreateRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @Email(message = "Email invalide") String email,
        @NotNull(message = "La note est obligatoire") @Min(1) @Max(5) Integer note,
        @NotBlank(message = "Le commentaire ne peut pas être vide") @Size(max = 2000, message = "Commentaire trop long (2000 caractères max)")
                String commentaire) {}
