package com.findoor.backend.web.controller;

import com.findoor.backend.security.UserPrincipal;
import com.findoor.backend.service.PaymentService;
import com.findoor.backend.web.dto.AbonnementDTO;
import com.findoor.backend.web.dto.PaiementCreateRequest;
import com.findoor.backend.web.dto.PaiementDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Abonnement propriétaire (phase 4 — paiement par période) — voir PaymentService pour le circuit complet. */
@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/api/proprietaire/abonnement")
    public AbonnementDTO monAbonnement(@AuthenticationPrincipal UserPrincipal principal) {
        return paymentService.monAbonnement(principal.id());
    }

    @PostMapping("/api/proprietaire/abonnement/paiements")
    public ResponseEntity<PaiementDTO> demarrer(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody PaiementCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.demarrer(principal.id(), request));
    }

    /**
     * Confirmation de paiement — en simulation, appelée directement par la page d'abonnement du
     * frontend (voir CinetPaySimulatedProvider) ; un vrai webhook CinetPay n'authentifie pas via JWT
     * mais via une signature de requête, d'où permitAll ici (cf. SecurityConfig, /api/public/**).
     */
    @PostMapping("/api/public/paiements/{reference}/confirmer")
    public PaiementDTO confirmer(@PathVariable String reference) {
        return paymentService.confirmer(reference);
    }
}
