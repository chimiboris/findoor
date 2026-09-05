package com.findoor.backend.service;

import java.util.List;

/** Reflète l'interface Angular `Filters` (frontend/src/app/core/services/listings.service.ts). */
public record AnnonceSearchCriteria(
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
        String sort) {}
