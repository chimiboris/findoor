package com.findoor.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

/** Saisie du formulaire de création/édition d'annonce (partie JSON du multipart, voir ProprietaireAnnonceController). */
public record AnnonceCreateRequest(
        @NotBlank(message = "La transaction est obligatoire") String transaction,
        @NotBlank(message = "Le type de bien est obligatoire") String type,
        Boolean meuble,
        @NotBlank(message = "La région est obligatoire") String region,
        @NotBlank(message = "Le département est obligatoire") String departement,
        @NotBlank(message = "L'arrondissement est obligatoire") String ville,
        @NotBlank(message = "Le quartier est obligatoire") String quartier,
        @NotNull(message = "Le prix est obligatoire") @Positive(message = "Le prix doit être positif") Long prix,
        String unite,
        Boolean uniteM2,
        Long prixTotal,
        @NotBlank(message = "Le titre est obligatoire") String titre,
        @NotNull(message = "La surface est obligatoire") @Positive(message = "La surface doit être positive") Integer surface,
        Integer pieces,
        Integer chambres,
        @NotBlank(message = "La description est obligatoire") String desc,
        List<String> equip,
        /** Édition uniquement : URLs des photos existantes à conserver (les autres sont supprimées). */
        List<String> keepPhotos,
        /** Réservé aux endpoints admin : propriétaire auquel rattacher/réassigner l'annonce. */
        Long ownerUserId) {}
