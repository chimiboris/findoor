package com.findoor.backend.service.payment;

import com.findoor.backend.domain.Paiement;

/**
 * Abstraction du fournisseur de paiement (voir plan phase 4) — permet de brancher un vrai
 * agrégateur (CinetPay, ou un second comme Flutterwave plus tard) sans toucher au reste du circuit
 * de paiement (PaymentService, machine à états de l'annonce).
 */
public interface PaymentProvider {

    String nom();

    /**
     * Initialise le paiement chez le fournisseur. Une vraie implémentation CinetPay appellerait ici
     * l'API `/v2/payment` avec l'apikey/site_id du compte marchand et renverrait l'URL de la page de
     * paiement hébergée vers laquelle rediriger le navigateur du propriétaire.
     */
    void initier(Paiement paiement);
}
