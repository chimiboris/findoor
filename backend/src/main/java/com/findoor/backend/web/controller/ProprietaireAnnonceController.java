package com.findoor.backend.web.controller;

import com.findoor.backend.security.UserPrincipal;
import com.findoor.backend.service.AnnonceService;
import com.findoor.backend.web.dto.AnnonceCreateRequest;
import com.findoor.backend.web.dto.AnnonceDTO;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Gestion des annonces du propriétaire connecté (tableau de bord, création/édition/suppression). */
@RestController
@RequestMapping("/api/proprietaire/annonces")
@RequiredArgsConstructor
public class ProprietaireAnnonceController {

    private final AnnonceService annonceService;

    @GetMapping
    public List<AnnonceDTO> mesAnnonces(@AuthenticationPrincipal UserPrincipal principal) {
        return annonceService.findByOwner(principal.id());
    }

    @GetMapping("/{id}")
    public AnnonceDTO uneAnnonce(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return annonceService.getOwned(principal.id(), id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnnonceDTO> creer(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("data") @Valid AnnonceCreateRequest data,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        // Création en libre-service : refusée si l'abonnement du propriétaire (phase 4) n'est pas actif.
        return ResponseEntity.status(HttpStatus.CREATED).body(annonceService.create(principal.user(), data, photos, true));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnnonceDTO modifier(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestPart("data") @Valid AnnonceCreateRequest data,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        return annonceService.update(principal.id(), id, data, photos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        annonceService.delete(principal.id(), id);
        return ResponseEntity.noContent().build();
    }
}
