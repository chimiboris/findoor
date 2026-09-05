package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Message;
import java.time.LocalDateTime;

/** Miroir de Message — réponse renvoyée au propriétaire (mes messages) et à l'admin (supervision). */
public record MessageDTO(
        Long id,
        Long annonceId,
        String annonceTitre,
        String expediteurNom,
        String expediteurEmail,
        String expediteurTelephone,
        String contenu,
        boolean lu,
        LocalDateTime dateCreation) {

    public static MessageDTO from(Message m) {
        return new MessageDTO(
                m.getId(),
                m.getAnnonceId(),
                m.getAnnonceTitre(),
                m.getExpediteurNom(),
                m.getExpediteurEmail(),
                m.getExpediteurTelephone(),
                m.getContenu(),
                m.isLu(),
                m.getDateCreation());
    }
}
