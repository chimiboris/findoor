package com.findoor.backend.service.otp;

import com.findoor.backend.domain.CanalOtp;
import com.findoor.backend.domain.User;
import com.findoor.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/** Envoi réel du code OTP par email (Spring Mail — MailHog en développement, un vrai SMTP en production). */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailOtpSender implements OtpSender {

    private final JavaMailSender mailSender;

    // Doit correspondre au compte authentifié (spring.mail.username) : Gmail rejette/réécrit un
    // "From" qui ne correspond pas au compte SMTP réellement utilisé pour l'envoi.
    @Value("${spring.mail.username:findoor100@gmail.com}")
    private String expediteur;

    @Override
    public CanalOtp canal() {
        return CanalOtp.EMAIL;
    }

    @Override
    public void envoyer(User destinataire, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("Findoor <" + expediteur + ">");
            message.setTo(destinataire.getEmail());
            message.setSubject("Findoor — Code de réinitialisation de mot de passe");
            message.setText(
                    "Bonjour " + destinataire.getPrenom() + ",\n\n"
                            + "Votre code de réinitialisation Findoor est : " + code + "\n\n"
                            + "Ce code est valable 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n"
                            + "— L'équipe Findoor");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email OTP à {}", destinataire.getEmail(), e);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Impossible d'envoyer l'email pour le moment. Réessayez plus tard.");
        }
    }
}
