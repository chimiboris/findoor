package com.findoor.backend.web.controller;

import com.findoor.backend.security.UserPrincipal;
import com.findoor.backend.service.AdminService;
import com.findoor.backend.service.AnnonceService;
import com.findoor.backend.web.dto.AdminStatsDTO;
import com.findoor.backend.web.dto.AdminUserCreateRequest;
import com.findoor.backend.web.dto.AdminUserUpdateRequest;
import com.findoor.backend.web.dto.AnnonceCreateRequest;
import com.findoor.backend.web.dto.AnnonceDTO;
import com.findoor.backend.web.dto.UserAdminDTO;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Back-office administrateur (accès réservé au rôle ADMIN, cf. SecurityConfig) — CRUD complet. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AnnonceService annonceService;

    @GetMapping("/stats")
    public AdminStatsDTO stats() {
        return adminService.stats();
    }

    // --- Annonces ---

    @GetMapping("/annonces")
    public List<AnnonceDTO> annonces() {
        return adminService.toutesLesAnnonces();
    }

    @GetMapping("/annonces/{id}")
    public AnnonceDTO uneAnnonce(@PathVariable Long id) {
        return annonceService.adminGetById(id);
    }

    @PostMapping(value = "/annonces", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnnonceDTO> creerAnnonce(
            @RequestPart("data") @Valid AnnonceCreateRequest data,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(annonceService.adminCreate(data, photos));
    }

    @PutMapping(value = "/annonces/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnnonceDTO modifierAnnonce(
            @PathVariable Long id,
            @RequestPart("data") @Valid AnnonceCreateRequest data,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        return annonceService.adminUpdate(id, data, photos);
    }

    @PatchMapping("/annonces/{id}/basculer")
    public AnnonceDTO basculerAnnonce(@PathVariable Long id) {
        return adminService.basculerAnnonce(id);
    }

    @DeleteMapping("/annonces/{id}")
    public ResponseEntity<Void> supprimerAnnonce(@PathVariable Long id) {
        adminService.supprimerAnnonce(id);
        return ResponseEntity.noContent().build();
    }

    // --- Utilisateurs ---

    @GetMapping("/utilisateurs")
    public List<UserAdminDTO> utilisateurs() {
        return adminService.tousLesUtilisateurs();
    }

    @GetMapping("/utilisateurs/{id}")
    public UserAdminDTO unUtilisateur(@PathVariable Long id) {
        return adminService.unUtilisateur(id);
    }

    @PostMapping("/utilisateurs")
    public ResponseEntity<UserAdminDTO> creerUtilisateur(@Valid @RequestBody AdminUserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.creerUtilisateur(request));
    }

    @PutMapping("/utilisateurs/{id}")
    public UserAdminDTO modifierUtilisateur(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return adminService.modifierUtilisateur(id, request);
    }

    @PatchMapping("/utilisateurs/{id}/basculer")
    public UserAdminDTO basculerUtilisateur(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return adminService.basculerUtilisateur(principal.id(), id);
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> supprimerUtilisateur(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminService.supprimerUtilisateur(principal.id(), id);
        return ResponseEntity.noContent().build();
    }
}
