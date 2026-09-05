package com.findoor.backend.service;

import com.findoor.backend.domain.CanalOtp;
import com.findoor.backend.domain.OtpCode;
import com.findoor.backend.domain.User;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.OtpCodeRepository;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.service.otp.OtpSender;
import com.findoor.backend.web.dto.ForgotPasswordRequest;
import com.findoor.backend.web.dto.ResetPasswordRequest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mot de passe oublié — génération/vérification d'un code OTP à usage unique (10 min), utilisable
 * aussi bien par un propriétaire que par un administrateur (même table `utilisateurs`).
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int DUREE_VALIDITE_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final List<OtpSender> senders;

    private Map<CanalOtp, OtpSender> sendersParCanal;

    @Transactional
    public void demanderReinitialisation(ForgotPasswordRequest request) {
        CanalOtp canal = CanalOtp.valueOf(request.canal());
        User user = trouverUtilisateur(request.identifiant(), canal);

        String code = genererCode();
        OtpCode otp = OtpCode.builder()
                .userId(user.getId())
                .code(code)
                .canal(canal)
                .dateExpiration(LocalDateTime.now().plusMinutes(DUREE_VALIDITE_MINUTES))
                .build();
        otpCodeRepository.save(otp);

        sender(canal).envoyer(user, code);
    }

    @Transactional
    public void reinitialiserMotDePasse(ResetPasswordRequest request) {
        // L'identifiant peut être un email ou un téléphone : on cherche l'utilisateur sur les deux champs.
        User user = userRepository.findByEmail(request.identifiant().toLowerCase())
                .or(() -> userRepository.findByTelephone(request.identifiant()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Code invalide ou expiré"));

        OtpCode otp = otpCodeRepository
                .findTopByUserIdAndCodeOrderByDateCreationDesc(user.getId(), request.code())
                .filter(OtpCode::estValide)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Code invalide ou expiré"));

        user.setMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
        otp.setUtilise(true);
    }

    private User trouverUtilisateur(String identifiant, CanalOtp canal) {
        var utilisateur = canal == CanalOtp.EMAIL
                ? userRepository.findByEmail(identifiant.toLowerCase())
                : userRepository.findByTelephone(identifiant);
        return utilisateur.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Aucun compte associé à cet identifiant"));
    }

    private OtpSender sender(CanalOtp canal) {
        if (sendersParCanal == null) {
            sendersParCanal = senders.stream().collect(Collectors.toMap(OtpSender::canal, s -> s));
        }
        OtpSender sender = sendersParCanal.get(canal);
        if (sender == null) throw new ApiException(HttpStatus.BAD_REQUEST, "Canal non pris en charge");
        return sender;
    }

    private static String genererCode() {
        return "%06d".formatted(RANDOM.nextInt(1_000_000));
    }
}
