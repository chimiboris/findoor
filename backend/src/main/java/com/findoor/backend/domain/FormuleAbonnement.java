package com.findoor.backend.domain;

/**
 * Formules d'abonnement propriétaire (phase 4) — le paiement se fait par PÉRIODE d'accès, pas par
 * annonce : tant que l'abonnement est valide (voir User.dateAccesExpire), toutes les annonces du
 * propriétaire sont publiables et visibles. Le tarif dégresse avec la durée pour encourager les
 * engagements longs (ex. 6 mois : 14 000 FCFA au lieu de 15 000 au tarif linéaire des 2 premiers
 * paliers). Barème de départ proposé — à ajuster avec le porteur du projet ; le reste du circuit de
 * paiement (PaymentService) ne dépend pas de ces valeurs précises.
 */
public enum FormuleAbonnement {
    DEUX_MOIS(2, 5_000L),
    QUATRE_MOIS(4, 10_000L),
    SIX_MOIS(6, 14_000L),
    HUIT_MOIS(8, 18_000L),
    DIX_MOIS(10, 21_000L),
    DOUZE_MOIS(12, 24_000L);

    private final int mois;
    private final long prixFcfa;

    FormuleAbonnement(int mois, long prixFcfa) {
        this.mois = mois;
        this.prixFcfa = prixFcfa;
    }

    public int mois() {
        return mois;
    }

    public long prixFcfa() {
        return prixFcfa;
    }
}
