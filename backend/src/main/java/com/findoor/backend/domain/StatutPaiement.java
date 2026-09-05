package com.findoor.backend.domain;

/** Cycle de vie d'une transaction de paiement (voir Paiement, PaymentService). */
public enum StatutPaiement {
    EN_ATTENTE,
    REUSSI,
    ECHOUE
}
