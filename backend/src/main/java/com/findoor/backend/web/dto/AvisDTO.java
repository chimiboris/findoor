package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Avis;
import java.time.LocalDateTime;

/** Miroir de Avis — réponse publique (avis publiés) et admin (supervision/modération). */
public record AvisDTO(
        Long id,
        Long annonceId,
        String annonceTitre,
        String nom,
        String email,
        Integer note,
        String commentaire,
        String statut,
        LocalDateTime dateCreation) {

    public static AvisDTO from(Avis a) {
        return new AvisDTO(
                a.getId(), a.getAnnonceId(), a.getAnnonceTitre(), a.getNom(), a.getEmail(),
                a.getNote(), a.getCommentaire(), a.getStatut().name(), a.getDateCreation());
    }
}
