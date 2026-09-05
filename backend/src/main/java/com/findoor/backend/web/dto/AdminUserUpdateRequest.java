package com.findoor.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Modification d'un compte par un administrateur. Le mot de passe n'est changé que s'il est renseigné. */
public record AdminUserUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prénom est obligatoire") String prenom,
        @NotBlank(message = "L'email est obligatoire") @Email(message = "Email invalide") String email,
        @NotBlank(message = "Le téléphone est obligatoire") String telephone,
        @NotBlank @Pattern(regexp = "VISITEUR|PROPRIETAIRE|ADMIN", message = "Rôle invalide") String role,
        String nouveauMotDePasse,
        /** Date ISO ("2027-03-15") jusqu'à laquelle l'accès (phase 4) est valide, ou vide/absente
         * pour couper l'accès — permet à l'admin de corriger manuellement un paiement en échec. */
        String dateAccesExpire) {}
