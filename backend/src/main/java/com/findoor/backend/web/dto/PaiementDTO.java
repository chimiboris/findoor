package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Paiement;
import java.time.LocalDateTime;

/** Miroir de Paiement — renvoyé après démarrage (contient la référence à confirmer en simulation). */
public record PaiementDTO(
        Long id,
        String formule,
        String moyen,
        Long montant,
        String statut,
        String reference,
        LocalDateTime dateCreation,
        LocalDateTime dateConfirmation) {

    public static PaiementDTO from(Paiement p) {
        return new PaiementDTO(
                p.getId(),
                p.getFormule().name(),
                p.getMoyen().name(),
                p.getMontant(),
                p.getStatut().name(),
                p.getReference(),
                p.getDateCreation(),
                p.getDateConfirmation());
    }
}
