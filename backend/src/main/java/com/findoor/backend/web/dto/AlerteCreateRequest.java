package com.findoor.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Critères d'une alerte de recherche (miroir de AnnonceSearchCriteria, sans le tri) + l'email d'envoi. */
public record AlerteCreateRequest(
        @NotBlank String transaction,
        String region,
        String departement,
        String arrondissement,
        String quartier,
        List<String> types,
        boolean meubleOui,
        boolean meubleNon,
        Long prixMin,
        Long prixMax,
        @NotNull @Email String email) {}
