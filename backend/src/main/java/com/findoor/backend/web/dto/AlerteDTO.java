package com.findoor.backend.web.dto;

import com.findoor.backend.domain.Alerte;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Miroir de Alerte — réponse à la création (visiteur) et à la liste de supervision (admin). */
public record AlerteDTO(
        Long id,
        String email,
        String transaction,
        String region,
        String departement,
        String arrondissement,
        String quartier,
        List<String> types,
        boolean meubleOui,
        boolean meubleNon,
        Long prixMin,
        Long prixMax,
        boolean actif,
        LocalDateTime dateCreation) {

    public static AlerteDTO from(Alerte a) {
        // new ArrayList<>(...) force le chargement de la collection (@ElementCollection, lazy par défaut)
        // pendant que la session Hibernate est encore ouverte (open-in-view=false) — sinon Jackson
        // échoue à la sérialisation (LazyInitializationException, hors transaction).
        return new AlerteDTO(
                a.getId(), a.getEmail(), a.getTransaction(), a.getRegion(), a.getDepartement(),
                a.getArrondissement(), a.getQuartier(), new ArrayList<>(a.getTypes()), a.isMeubleOui(), a.isMeubleNon(),
                a.getPrixMin(), a.getPrixMax(), a.isActif(), a.getDateCreation());
    }
}
