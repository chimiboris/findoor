package com.findoor.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Compte utilisateur (visiteur inscrit, propriétaire ou administrateur). */
@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false, length = 30)
    private String telephone;

    @Column(name = "telephone_secondaire", length = 30)
    private String telephoneSecondaire;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(name = "email_verifie", nullable = false)
    @Builder.Default
    private boolean emailVerifie = false;

    /**
     * Jusqu'à quand l'abonnement (phase 4 — paiement par période, pas par annonce) donne accès à la
     * publication : tant que cette date n'est pas dépassée, le propriétaire peut publier de nouvelles
     * annonces et TOUTES ses annonces restent visibles publiquement. Null = jamais abonné. Un admin
     * peut la modifier directement (voir AdminService) pour couvrir un paiement en échec côté réseau.
     */
    @Column(name = "date_acces_expire")
    private LocalDate dateAccesExpire;

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

    public boolean abonnementActif() {
        return dateAccesExpire != null && !dateAccesExpire.isBefore(LocalDate.now());
    }
}
