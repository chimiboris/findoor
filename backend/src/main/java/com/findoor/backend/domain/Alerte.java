package com.findoor.backend.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Alerte de recherche (phase 6) — un visiteur enregistre les critères d'une recherche (sans compte,
 * juste un email) et reçoit un email quand une nouvelle annonce correspondante est publiée (voir
 * AlerteService, tâche planifiée). {@link #token} permet de se désabonner sans authentification.
 */
@Entity
@Table(name = "alertes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(nullable = false, length = 20)
    private String transaction;

    @Column(length = 60)
    private String region;

    @Column(length = 60)
    private String departement;

    @Column(length = 60)
    private String arrondissement;

    @Column(length = 100)
    private String quartier;

    @ElementCollection
    @CollectionTable(name = "alerte_types", joinColumns = @JoinColumn(name = "alerte_id"))
    @Column(name = "type", length = 40)
    @Builder.Default
    private List<String> types = new ArrayList<>();

    @Column(name = "meuble_oui")
    @Builder.Default
    private boolean meubleOui = false;

    @Column(name = "meuble_non")
    @Builder.Default
    private boolean meubleNon = false;

    @Column(name = "prix_min")
    private Long prixMin;

    @Column(name = "prix_max")
    private Long prixMax;

    /** Désabonnement sans compte (lien dans l'email de confirmation/digest). */
    @Column(nullable = false, unique = true, length = 60)
    private String token;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /** Dernière fois qu'un digest a été envoyé (ou date de création si jamais) — sert de filtre
     * "nouvelles annonces depuis". */
    @Column(name = "derniere_verification", nullable = false)
    private LocalDateTime derniereVerification;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.dateCreation = now;
        this.derniereVerification = now;
    }
}
