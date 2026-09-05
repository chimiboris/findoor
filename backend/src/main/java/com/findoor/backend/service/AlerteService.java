package com.findoor.backend.service;

import com.findoor.backend.domain.Alerte;
import com.findoor.backend.domain.Annonce;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.AlerteRepository;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.AnnonceSpecifications;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.web.dto.AlerteCreateRequest;
import com.findoor.backend.web.dto.AlerteDTO;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Alertes de recherche (phase 6) — un visiteur enregistre les critères d'une recherche (sans compte)
 * et reçoit un email de confirmation avec un lien de désabonnement, puis un email « digest » à chaque
 * fois qu'une nouvelle annonce correspondante est publiée (tâche planifiée {@link #verifierAlertes()}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:findoor100@gmail.com}")
    private String expediteur;

    @Value("${findoor.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public AlerteDTO creer(AlerteCreateRequest r) {
        Alerte alerte = Alerte.builder()
                .email(r.email())
                .transaction(r.transaction())
                .region(r.region())
                .departement(r.departement())
                .arrondissement(r.arrondissement())
                .quartier(r.quartier())
                .types(r.types() != null ? new ArrayList<>(r.types()) : new ArrayList<>())
                .meubleOui(r.meubleOui())
                .meubleNon(r.meubleNon())
                .prixMin(r.prixMin())
                .prixMax(r.prixMax())
                .token(UUID.randomUUID().toString())
                .build();
        Alerte saved = alerteRepository.save(alerte);
        envoyerConfirmation(saved);
        return AlerteDTO.from(saved);
    }

    @Transactional
    public void desabonner(String token) {
        Alerte alerte = alerteRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Alerte introuvable"));
        alerte.setActif(false);
    }

    @Transactional(readOnly = true)
    public List<AlerteDTO> toutes() {
        return alerteRepository.findAllByOrderByDateCreationDesc().stream().map(AlerteDTO::from).toList();
    }

    /**
     * Tâche planifiée : pour chaque alerte active, cherche les annonces publiées depuis la dernière
     * vérification correspondant à ses critères et envoie un digest si au moins une correspond.
     * Toutes les heures — suffisant pour une alerte email, sans surcharger la base.
     */
    @Scheduled(fixedRate = 60 * 60 * 1000L)
    @Transactional
    public void verifierAlertes() {
        List<Alerte> actives = alerteRepository.findByActifTrue();
        if (actives.isEmpty()) return;

        List<Long> ownerIdsValides = userRepository.findIdsAvecAccesValide();
        for (Alerte alerte : actives) {
            try {
                traiterAlerte(alerte, ownerIdsValides);
            } catch (Exception e) {
                log.warn("Échec de la vérification de l'alerte {}", alerte.getId(), e);
            }
        }
    }

    private void traiterAlerte(Alerte alerte, List<Long> ownerIdsValides) {
        Specification<Annonce> spec = Specification.where(AnnonceSpecifications.actives())
                .and(AnnonceSpecifications.ownerAvecAccesValide(ownerIdsValides))
                .and(AnnonceSpecifications.transaction(alerte.getTransaction()))
                .and(AnnonceSpecifications.creeeApres(alerte.getDerniereVerification()));

        if (hasText(alerte.getRegion())) spec = spec.and(AnnonceSpecifications.region(alerte.getRegion()));
        if (hasText(alerte.getDepartement())) spec = spec.and(AnnonceSpecifications.departement(alerte.getDepartement()));
        if (hasText(alerte.getArrondissement())) spec = spec.and(AnnonceSpecifications.arrondissement(alerte.getArrondissement()));
        if (hasText(alerte.getQuartier())) spec = spec.and(AnnonceSpecifications.quartierContains(alerte.getQuartier()));
        if (alerte.getTypes() != null && !alerte.getTypes().isEmpty()) spec = spec.and(AnnonceSpecifications.typeIn(alerte.getTypes()));
        if ("louer".equals(alerte.getTransaction())) {
            if (alerte.isMeubleOui() && !alerte.isMeubleNon()) spec = spec.and(AnnonceSpecifications.meuble(true));
            if (alerte.isMeubleNon() && !alerte.isMeubleOui()) spec = spec.and(AnnonceSpecifications.meuble(false));
        }
        if (alerte.getPrixMin() != null) spec = spec.and(AnnonceSpecifications.prixMin(alerte.getPrixMin()));
        if (alerte.getPrixMax() != null) spec = spec.and(AnnonceSpecifications.prixMax(alerte.getPrixMax()));

        List<Annonce> nouvelles = annonceRepository.findAll(spec);
        LocalDateTime maintenant = LocalDateTime.now();
        if (!nouvelles.isEmpty()) {
            envoyerDigest(alerte, nouvelles);
        }
        alerte.setDerniereVerification(maintenant);
    }

    private void envoyerConfirmation(Alerte alerte) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom("Findoor <" + expediteur + ">");
            mail.setTo(alerte.getEmail());
            mail.setSubject("Findoor — Votre alerte de recherche est activée");
            mail.setText(
                    "Bonjour,\n\n"
                            + "Votre alerte de recherche Findoor est activée : vous recevrez un email dès qu'une nouvelle annonce correspondant à vos critères sera publiée.\n\n"
                            + "Pour vous désabonner à tout moment : " + lienDesabonnement(alerte) + "\n\n"
                            + "— L'équipe Findoor");
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Échec de l'email de confirmation d'alerte pour {}", alerte.getEmail(), e);
        }
    }

    private void envoyerDigest(Alerte alerte, List<Annonce> nouvelles) {
        try {
            StringBuilder corps = new StringBuilder();
            corps.append("Bonjour,\n\n")
                    .append(nouvelles.size() == 1
                            ? "Une nouvelle annonce correspond à votre alerte Findoor :\n\n"
                            : nouvelles.size() + " nouvelles annonces correspondent à votre alerte Findoor :\n\n");
            for (Annonce a : nouvelles) {
                corps.append("• ").append(a.getTitre()).append(" — ").append(frontendUrl).append("/annonce/").append(a.getId()).append('\n');
            }
            corps.append("\nPour vous désabonner : ").append(lienDesabonnement(alerte)).append("\n\n— L'équipe Findoor");

            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom("Findoor <" + expediteur + ">");
            mail.setTo(alerte.getEmail());
            mail.setSubject("Findoor — " + nouvelles.size() + (nouvelles.size() == 1 ? " nouvelle annonce" : " nouvelles annonces") + " pour vous");
            mail.setText(corps.toString());
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Échec de l'envoi du digest d'alerte {} à {}", alerte.getId(), alerte.getEmail(), e);
        }
    }

    private String lienDesabonnement(Alerte alerte) {
        return frontendUrl + "/alertes/desabonner/" + alerte.getToken();
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
