package com.findoor.backend.service.payment;

import com.findoor.backend.domain.Paiement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Simulation locale de CinetPay — AUCUNE connexion réelle aux serveurs CinetPay : il n'y a pas de
 * compte marchand configuré (voir plan phase 4, "nécessite de votre côté : un compte marchand
 * CinetPay"). Le frontend affiche une page d'abonnement Findoor qui imite le choix MTN
 * MoMo/Orange Money/Carte, puis appelle directement notre propre endpoint de confirmation — exactement
 * comme le ferait le webhook CinetPay réel, ce qui permet de valider tout le circuit (transaction,
 * prolongation de l'accès du propriétaire) dès maintenant.
 *
 * Pour brancher le vrai CinetPay plus tard : implémenter {@link PaymentProvider} avec un appel à
 * `POST https://api-checkout.cinetpay.com/v2/payment` (apikey + site_id du compte marchand), stocker
 * l'URL de paiement renvoyée, et faire confirmer les transactions via le vrai webhook CinetPay
 * (signature `cpm_trans_id` à vérifier) plutôt que par cet appel direct non authentifié.
 */
@Component
@Slf4j
public class CinetPaySimulatedProvider implements PaymentProvider {

    @Override
    public String nom() {
        return "CinetPay (simulation locale — aucun compte marchand connecté)";
    }

    @Override
    public void initier(Paiement paiement) {
        log.info(
                "[Paiement simulé] Transaction {} créée pour le propriétaire {} — {} FCFA via {}. "
                        + "Aucun appel réseau réel : confirmez via POST /api/public/paiements/{}/confirmer.",
                paiement.getReference(), paiement.getOwnerUserId(), paiement.getMontant(), paiement.getMoyen(), paiement.getReference());
    }
}
