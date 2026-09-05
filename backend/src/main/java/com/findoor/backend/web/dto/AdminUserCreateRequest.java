package com.findoor.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Création d'un compte par un administrateur (propriétaire ou nouvel administrateur). */
public record AdminUserCreateRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prénom est obligatoire") String prenom,
        @NotBlank(message = "L'email est obligatoire") @Email(message = "Email invalide") String email,
        @NotBlank(message = "Le téléphone est obligatoire") String telephone,
        @NotBlank(message = "Le mot de passe est obligatoire")
                @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
                String motDePasse,
        @NotBlank @Pattern(regexp = "VISITEUR|PROPRIETAIRE|ADMIN", message = "Rôle invalide") String role,
        /** Optionnel — date ISO ("2027-03-15") jusqu'à laquelle accorder immédiatement l'accès
         * (phase 4), par exemple pour créer un compte propriétaire déjà "abonné". */
        String dateAccesExpire) {}
