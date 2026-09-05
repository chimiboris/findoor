package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Annonce;
import java.util.ArrayList;
import java.util.List;

/** Reflète exactement l'interface Angular `Annonce` (frontend/src/app/core/models/property.model.ts). */
public record AnnonceDTO(
        Long id,
        String transaction,
        String type,
        Boolean meuble,
        String region,
        String departement,
        String ville,
        String quartier,
        Long prix,
        String unite,
        Boolean uniteM2,
        Long prixTotal,
        String titre,
        Integer surface,
        Integer pieces,
        Integer chambres,
        String desc,
        List<String> equip,
        String owner,
        String initials,
        String ownerTelephone,
        Long ownerUserId,
        List<String> photos,
        Double latitude,
        Double longitude,
        Boolean actif,
        /** false si l'abonnement (phase 4) du propriétaire est expiré/jamais souscrit — l'annonce
         * n'est alors pas visible publiquement même si {@link #actif} vaut true. Toujours true pour
         * les annonces sans propriétaire réel (démonstration) ou déjà filtrées côté recherche
         * publique (search/vedettes/similaires n'excluent que les inéligibles, donc always true là). */
        Boolean abonnementProprietaireActif) {

    /** Contexte owner-agnostique (recherche publique déjà filtrée, ou non pertinent). */
    public static AnnonceDTO from(Annonce a) {
        return from(a, true);
    }

    public static AnnonceDTO from(Annonce a, boolean abonnementProprietaireActif) {
        return new AnnonceDTO(
                a.getId(),
                a.getTransaction(),
                a.getType(),
                a.getMeuble(),
                a.getRegion(),
                a.getDepartement(),
                a.getVille(),
                a.getQuartier(),
                a.getPrix(),
                a.getUnite(),
                a.isUniteM2(),
                a.getPrixTotal(),
                a.getTitre(),
                a.getSurface(),
                a.getPieces(),
                a.getChambres(),
                a.getDescription(),
                new ArrayList<>(a.getEquipements()),
                a.getOwnerNom(),
                a.getOwnerInitials(),
                a.getOwnerTelephone(),
                a.getOwnerUserId(),
                new ArrayList<>(a.getPhotos()),
                a.getLatitude(),
                a.getLongitude(),
                a.isActif(),
                abonnementProprietaireActif);
    }
}
