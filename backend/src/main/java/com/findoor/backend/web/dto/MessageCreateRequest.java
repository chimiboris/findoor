package com.findoor.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Formulaire "Envoyer un message" (fiche annonce, public — aucune authentification requise). */
public record MessageCreateRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "L'email est obligatoire") @Email(message = "Email invalide") String email,
        String telephone,
        @NotBlank(message = "Le message ne peut pas être vide") @Size(max = 2000, message = "Message trop long (2000 caractères max)")
                String contenu) {}
