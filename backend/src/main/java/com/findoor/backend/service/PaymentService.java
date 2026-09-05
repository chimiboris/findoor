package com.findoor.backend.service;

import com.findoor.backend.domain.FormuleAbonnement;
import com.findoor.backend.domain.MoyenPaiement;
import com.findoor.backend.domain.Paiement;
import com.findoor.backend.domain.StatutPaiement;
import com.findoor.backend.domain.User;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.PaiementRepository;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.service.payment.PaymentProvider;
import com.findoor.backend.web.dto.AbonnementDTO;
import com.findoor.backend.web.dto.PaiementCreateRequest;
import com.findoor.backend.web.dto.PaiementDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Abonnement propriétaire (phase 4) : le propriétaire paie pour une PÉRIODE d'accès (pas pour une
 * annonce précise) — une transaction EN_ATTENTE est créée et transmise au {@link PaymentProvider}
 * (simulation locale tant qu'aucun compte marchand CinetPay n'est configuré), puis la confirmation
 * (webhook réel demain, appel direct en simulation aujourd'hui) prolonge {@link User#getDateAccesExpire()}
 * de la durée achetée — ce qui rend immédiatement TOUTES ses annonces publiables/visibles à nouveau.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaiementRepository paiementRepository;
    private final UserRepository userRepository;
    private final PaymentProvider paymentProvider;

    @Transactional(readOnly = true)
    public AbonnementDTO monAbonnement(Long ownerUserId) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Compte introuvable"));
        return new AbonnementDTO(owner.getDateAccesExpire(), owner.abonnementActif());
    }

    @Transactional
    public PaiementDTO demarrer(Long ownerUserId, PaiementCreateRequest r) {
        if (!userRepository.existsById(ownerUserId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Compte introuvable");
        }

        FormuleAbonnement formule = FormuleAbonnement.valueOf(r.formule());
        MoyenPaiement moyen = MoyenPaiement.valueOf(r.moyen());

        Paiement paiement = Paiement.builder()
                .ownerUserId(ownerUserId)
                .formule(formule)
                .moyen(moyen)
                .montant(formule.prixFcfa())
                .reference("FINDOOR-" + UUID.randomUUID())
                .build();
        Paiement saved = paiementRepository.save(paiement);

        paymentProvider.initier(saved);

        return PaiementDTO.from(saved);
    }

    /**
     * Confirme une transaction — en simulation, appelée directement par la page d'abonnement du
     * frontend ; avec un vrai fournisseur, ce serait le webhook signé de CinetPay qui appellerait cet
     * endpoint. Idempotent : confirmer une transaction déjà REUSSI ne fait rien de plus. Prolonge
     * l'abonnement à partir de la date d'expiration actuelle si elle n'est pas encore dépassée
     * (renouvellement anticipé), sinon à partir d'aujourd'hui.
     */
    @Transactional
    public PaiementDTO confirmer(String reference) {
        Paiement paiement = paiementRepository.findByReference(reference)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transaction introuvable"));

        if (paiement.getStatut() == StatutPaiement.REUSSI) {
            return PaiementDTO.from(paiement);
        }

        paiement.setStatut(StatutPaiement.REUSSI);
        paiement.setDateConfirmation(LocalDateTime.now());

        User owner = userRepository.findById(paiement.getOwnerUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Compte introuvable"));
        LocalDate base = owner.abonnementActif() ? owner.getDateAccesExpire() : LocalDate.now();
        owner.setDateAccesExpire(base.plusMonths(paiement.getFormule().mois()));

        return PaiementDTO.from(paiement);
    }
}
