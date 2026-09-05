package com.findoor.backend.service.otp;

import com.findoor.backend.domain.CanalOtp;
import com.findoor.backend.domain.User;

/** Abstraction d'envoi du code OTP — une implémentation par canal (EMAIL, SMS). */
public interface OtpSender {

    CanalOtp canal();

    /** Envoie le code à l'utilisateur. Doit lever ApiException si l'envoi est impossible (ex. pas de téléphone connu). */
    void envoyer(User destinataire, String code);
}
