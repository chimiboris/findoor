package com.findoor.backend.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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
 * Annonce immobilière (location ou vente). Le type de bien reste une chaîne libre (pas un enum figé)
 * pour pouvoir accueillir de nouvelles natures de biens sans migration de schéma (cf. plan phase 0).
 */
@Entity
@Table(name = "annonces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 'louer' ou 'acheter'. */
    @Column(nullable = false, length = 20)
    private String transaction;

    @Column(nullable = false, length = 40)
    private String type;

    /** Non applicable (null) pour une vente. */
    @Column
    private Boolean meuble;

    @Column(nullable = false, length = 60)
    private String region;

    @Column(nullable = false, length = 60)
    private String departement;

    /** Arrondissement (= "ville" au sens administratif camerounais). */
    @Column(nullable = false, length = 60)
    private String ville;

    @Column(nullable = false, length = 100)
    private String quartier;

    /** Position GPS approximative du bien (voir GeoCoordonnees) — utilisée pour la carte interactive. */
    private Double latitude;

    private Double longitude;

    /** Loyer mensuel, prix net vendeur, ou prix au m² si {@link #uniteM2}. */
    @Column(nullable = false)
    private Long prix;

    /** '/mois' pour une location, vide pour une vente au prix net. */
    @Column(length = 20)
    private String unite;

    @Column(name = "unite_m2", nullable = false)
    @Builder.Default
    private boolean uniteM2 = false;

    /** Prix total estimé quand le bien est vendu au m² (terrain). */
    @Column(name = "prix_total")
    private Long prixTotal;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(nullable = false)
    private Integer surface;

    private Integer pieces;

    private Integer chambres;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "annonce_equipements", joinColumns = @JoinColumn(name = "annonce_id"))
    @Column(name = "equipement", length = 120)
    @Builder.Default
    private List<String> equipements = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "annonce_photos", joinColumns = @JoinColumn(name = "annonce_id"))
    @OrderColumn(name = "position")
    @Column(name = "url", length = 500)
    @Builder.Default
    private List<String> photos = new ArrayList<>();

    @Column(name = "owner_nom", nullable = false, length = 150)
    private String ownerNom;

    @Column(name = "owner_initials", nullable = false, length = 4)
    private String ownerInitials;

    /** Téléphone réel du propriétaire (copié depuis son compte) — pour l'appel/WhatsApp direct depuis la fiche. */
    @Column(name = "owner_telephone", length = 30)
    private String ownerTelephone;

    /** Propriétaire réel (compte PROPRIETAIRE) — null pour les annonces de démonstration. */
    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @Column(nullable = false)
    @Builder.Default
    private boolean vedette = false;

    /** Suspension/réactivation par un administrateur uniquement (voir AdminService) — la visibilité
     * liée au paiement se fait maintenant au niveau du compte propriétaire, pas de l'annonce (phase 4,
     * voir User.dateAccesExpire et AnnonceSpecifications.ownerAvecAccesValide). */
    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_maj", nullable = false)
    private LocalDateTime dateMaj;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.dateCreation = now;
        this.dateMaj = now;
    }

    @PreUpdate
    void onUpdate() {
        this.dateMaj = LocalDateTime.now();
    }
}
