package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Role;
import com.findoor.backend.domain.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Vue "back-office" d'un utilisateur — gestion des comptes par un administrateur. */
public record UserAdminDTO(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        Role role,
        boolean actif,
        boolean emailVerifie,
        LocalDateTime dateCreation,
        /** Abonnement propriétaire (phase 4, paiement par période) — null si jamais souscrit.
         * L'admin peut la modifier directement (voir AdminUserUpdateRequest) pour couvrir un paiement
         * en échec dû au réseau ou à un autre problème. */
        LocalDate dateAccesExpire,
        boolean abonnementActif) {

    public static UserAdminDTO from(User u) {
        return new UserAdminDTO(
                u.getId(), u.getNom(), u.getPrenom(), u.getEmail(), u.getTelephone(),
                u.getRole(), u.isActif(), u.isEmailVerifie(), u.getDateCreation(),
                u.getDateAccesExpire(), u.abonnementActif());
    }
}
