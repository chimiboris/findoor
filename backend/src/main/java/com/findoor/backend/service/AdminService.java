package com.findoor.backend.service;

import com.findoor.backend.domain.Annonce;
import com.findoor.backend.domain.Role;
import com.findoor.backend.domain.User;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.web.dto.AdminStatsDTO;
import com.findoor.backend.web.dto.AdminUserCreateRequest;
import com.findoor.backend.web.dto.AdminUserUpdateRequest;
import com.findoor.backend.web.dto.AnnonceDTO;
import com.findoor.backend.web.dto.UserAdminDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Back-office administrateur — modération des annonces (CRUD complet), gestion des comptes utilisateurs
 * (CRUD complet, y compris la création d'autres administrateurs). Seule l'action sur SOI-MÊME (se
 * suspendre ou se supprimer) est bloquée, par sécurité — un admin a tous les droits sur les autres
 * comptes, y compris les autres comptes ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // --- Annonces ---

    @Transactional(readOnly = true)
    public List<AnnonceDTO> toutesLesAnnonces() {
        Set<Long> ownerIdsValides = Set.copyOf(userRepository.findIdsAvecAccesValide());
        return annonceRepository.findAllByOrderByDateCreationDesc().stream()
                .map(a -> AnnonceDTO.from(a, a.getOwnerUserId() == null || ownerIdsValides.contains(a.getOwnerUserId())))
                .toList();
    }

    @Transactional
    public AnnonceDTO basculerAnnonce(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        annonce.setActif(!annonce.isActif());
        return AnnonceDTO.from(annonce);
    }

    @Transactional
    public void supprimerAnnonce(Long id) {
        if (!annonceRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable");
        }
        annonceRepository.deleteById(id);
    }

    // --- Utilisateurs ---

    @Transactional(readOnly = true)
    public List<UserAdminDTO> tousLesUtilisateurs() {
        return userRepository.findAllByOrderByDateCreationDesc().stream().map(UserAdminDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public UserAdminDTO unUtilisateur(Long id) {
        return userRepository.findById(id).map(UserAdminDTO::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    @Transactional
    public UserAdminDTO creerUtilisateur(AdminUserCreateRequest r) {
        if (userRepository.existsByEmail(r.email().toLowerCase())) {
            throw new ApiException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        User user = User.builder()
                .nom(r.nom())
                .prenom(r.prenom())
                .email(r.email().toLowerCase())
                .telephone(r.telephone())
                .motDePasse(passwordEncoder.encode(r.motDePasse()))
                .role(Role.valueOf(r.role()))
                .actif(true)
                .emailVerifie(true)
                .dateAccesExpire(parseDate(r.dateAccesExpire()))
                .build();
        return UserAdminDTO.from(userRepository.save(user));
    }

    @Transactional
    public UserAdminDTO modifierUtilisateur(Long id, AdminUserUpdateRequest r) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        userRepository.findByEmail(r.email().toLowerCase())
                .filter(autre -> !autre.getId().equals(id))
                .ifPresent(autre -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Un autre compte utilise déjà cet email");
                });

        user.setNom(r.nom());
        user.setPrenom(r.prenom());
        user.setEmail(r.email().toLowerCase());
        user.setTelephone(r.telephone());
        user.setRole(Role.valueOf(r.role()));
        user.setDateAccesExpire(parseDate(r.dateAccesExpire()));
        if (r.nouveauMotDePasse() != null && !r.nouveauMotDePasse().isBlank()) {
            user.setMotDePasse(passwordEncoder.encode(r.nouveauMotDePasse()));
        }
        return UserAdminDTO.from(user);
    }

    /** L'admin envoie une date ISO ("2027-03-15"), une chaîne vide/absente pour "aucun accès". */
    private static LocalDate parseDate(String iso) {
        return (iso == null || iso.isBlank()) ? null : LocalDate.parse(iso);
    }

    @Transactional
    public UserAdminDTO basculerUtilisateur(Long currentAdminId, Long id) {
        if (currentAdminId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas suspendre votre propre compte");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        user.setActif(!user.isActif());
        return UserAdminDTO.from(user);
    }

    @Transactional
    public void supprimerUtilisateur(Long currentAdminId, Long id) {
        if (currentAdminId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas supprimer votre propre compte");
        }
        if (!userRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Utilisateur introuvable");
        }
        // Supprime aussi les annonces de cet utilisateur (sinon la contrainte de clé étrangère bloquerait).
        annonceRepository.deleteAll(annonceRepository.findByOwnerUserIdOrderByDateCreationDesc(id));
        userRepository.deleteById(id);
    }

    // --- Statistiques ---

    @Transactional(readOnly = true)
    public AdminStatsDTO stats() {
        long annoncesTotal = annonceRepository.count();
        long annoncesActives = annonceRepository.countByActifTrue();
        long annoncesInactives = annonceRepository.countByActifFalse();
        long utilisateursTotal = userRepository.count();
        long proprietaires = userRepository.countByRole(Role.PROPRIETAIRE);
        long admins = userRepository.countByRole(Role.ADMIN);
        long comptesInactifs = userRepository.countByActifFalse();
        return new AdminStatsDTO(annoncesTotal, annoncesActives, annoncesInactives, utilisateursTotal, proprietaires, admins, comptesInactifs);
    }
}
