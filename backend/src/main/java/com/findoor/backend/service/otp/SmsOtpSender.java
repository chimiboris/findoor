package com.findoor.backend.service.otp;

import com.findoor.backend.domain.CanalOtp;
import com.findoor.backend.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Canal SMS — le mécanisme OTP (génération, expiration, vérification, changement de mot de passe)
 * est entièrement réel et fonctionnel ; seul le TRANSPORT SMS n'est pas encore relié à un fournisseur
 * réel (Twilio, Africa's Talking, Orange/MTN SMS API…), ce qui nécessite un compte et des identifiants
 * côté client — exactement comme pour CinetPay (phase 4). En attendant, le code est journalisé côté
 * serveur pour permettre de tester le flux de bout en bout.
 */
@Component
@Slf4j
public class SmsOtpSender implements OtpSender {

    @Override
    public CanalOtp canal() {
        return CanalOtp.SMS;
    }

    @Override
    public void envoyer(User destinataire, String code) {
        log.warn(
                "[SMS OTP - fournisseur non connecté] Code {} pour {} ({}) — brancher un fournisseur SMS réel pour un envoi effectif.",
                code, destinataire.getTelephone(), destinataire.getEmail());
    }
}
