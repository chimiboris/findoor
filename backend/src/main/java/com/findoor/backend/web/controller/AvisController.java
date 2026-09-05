package com.findoor.backend.web.controller;

import com.findoor.backend.service.AvisService;
import com.findoor.backend.web.dto.AvisCreateRequest;
import com.findoor.backend.web.dto.AvisDTO;
import com.findoor.backend.web.dto.AvisResumeDTO;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Avis sur les annonces (phase 6) : dépôt public, lecture publique (publiés), modération admin. */
@RestController
@RequiredArgsConstructor
public class AvisController {

    private final AvisService avisService;

    @PostMapping("/api/public/annonces/{id}/avis")
    public ResponseEntity<AvisDTO> deposer(@PathVariable Long id, @Valid @RequestBody AvisCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avisService.deposer(id, request));
    }

    @GetMapping("/api/public/annonces/{id}/avis")
    public List<AvisDTO> avisPublies(@PathVariable Long id) {
        return avisService.publiesPour(id);
    }

    @GetMapping("/api/public/annonces/{id}/avis/resume")
    public AvisResumeDTO resume(@PathVariable Long id) {
        return avisService.resumePour(id);
    }

    @GetMapping("/api/admin/avis")
    public List<AvisDTO> tousLesAvis() {
        return avisService.tousLesAvis();
    }

    @PatchMapping("/api/admin/avis/{id}/approuver")
    public AvisDTO approuver(@PathVariable Long id) {
        return avisService.approuver(id);
    }

    @PatchMapping("/api/admin/avis/{id}/rejeter")
    public AvisDTO rejeter(@PathVariable Long id) {
        return avisService.rejeter(id);
    }

    @DeleteMapping("/api/admin/avis/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        avisService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
