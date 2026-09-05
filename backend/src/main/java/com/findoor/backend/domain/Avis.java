package com.findoor.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Avis d'un visiteur sur une annonce (phase 6) — déposé sans compte requis, publié seulement après
 * modération par un admin (voir StatutAvis, AvisService) pour éviter les abus sur un contenu public.
 */
@Entity
@Table(name = "avis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annonce_id", nullable = false)
    private Long annonceId;

    /** Copié au moment du dépôt — reste lisible même si le titre de l'annonce change ensuite. */
    @Column(name = "annonce_titre", nullable = false)
    private String annonceTitre;

    @Column(nullable = false, length = 120)
    private String nom;

    @Column(length = 180)
    private String email;

    /** Note sur 5, entière. */
    @Column(nullable = false)
    private Integer note;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutAvis statut = StatutAvis.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}
