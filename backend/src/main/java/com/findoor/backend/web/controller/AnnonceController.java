package com.findoor.backend.web.controller;

import com.findoor.backend.service.AnnonceSearchCriteria;
import com.findoor.backend.service.AnnonceService;
import com.findoor.backend.web.dto.AnnonceDTO;
import com.findoor.backend.web.dto.StatsDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Recherche publique d'annonces (accueil, résultats, fiche) — aucune authentification requise. */
@RestController
@RequestMapping("/api/public/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;

    @GetMapping
    public List<AnnonceDTO> search(
            @RequestParam(defaultValue = "louer") String transaction,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String departement,
            @RequestParam(required = false) String arrondissement,
            @RequestParam(required = false) String quartier,
            @RequestParam(required = false) List<String> types,
            @RequestParam(defaultValue = "false") boolean meubleOui,
            @RequestParam(defaultValue = "false") boolean meubleNon,
            @RequestParam(required = false) Long prixMin,
            @RequestParam(required = false) Long prixMax,
            @RequestParam(defaultValue = "pertinence") String sort) {
        return annonceService.search(new AnnonceSearchCriteria(
                transaction, region, departement, arrondissement, quartier, types, meubleOui, meubleNon, prixMin, prixMax, sort));
    }

    @GetMapping("/vedettes")
    public List<AnnonceDTO> vedettes() {
        return annonceService.featured();
    }

    @GetMapping("/stats")
    public StatsDTO stats() {
        return annonceService.stats();
    }

    @GetMapping("/{id}")
    public AnnonceDTO getOne(@PathVariable Long id) {
        return annonceService.getById(id);
    }

    @GetMapping("/{id}/similaires")
    public List<AnnonceDTO> similaires(@PathVariable Long id) {
        return annonceService.similar(id, 3);
    }
}
