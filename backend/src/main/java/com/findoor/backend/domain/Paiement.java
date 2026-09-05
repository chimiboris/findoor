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
 * Transaction de paiement pour l'abonnement d'un propriétaire (phase 4) — paie pour une PÉRIODE
 * d'accès (voir User.dateAccesExpire), pas pour une annonce en particulier : une fois payée, TOUTES
 * les annonces du propriétaire redeviennent visibles pour la durée achetée. Une transaction est créée
 * EN_ATTENTE au moment où le propriétaire choisit sa formule, puis passe à REUSSI quand le fournisseur
 * de paiement confirme (webhook) — voir PaymentService et PaymentProvider.
 */
@Entity
@Table(name = "paiements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FormuleAbonnement formule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MoyenPaiement moyen;

    @Column(nullable = false)
    private Long montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;

    /** Référence unique envoyée au fournisseur de paiement — sert d'identifiant de webhook. */
    @Column(nullable = false, unique = true, length = 60)
    private String reference;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_confirmation")
    private LocalDateTime dateConfirmation;

    @PrePersist
    void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}
