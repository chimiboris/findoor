package com.findoor.backend.web.controller;

import com.findoor.backend.service.AuthService;
import com.findoor.backend.service.OtpService;
import com.findoor.backend.web.dto.AuthResponse;
import com.findoor.backend.web.dto.ForgotPasswordRequest;
import com.findoor.backend.web.dto.LoginRequest;
import com.findoor.backend.web.dto.RefreshRequest;
import com.findoor.backend.web.dto.RegisterRequest;
import com.findoor.backend.web.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/inscription")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/connexion")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/rafraichir")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    /** Mot de passe oublié — envoie un code OTP par email ou SMS (utilisateurs et administrateurs). */
    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<Void> motDePasseOublie(@Valid @RequestBody ForgotPasswordRequest request) {
        otpService.demanderReinitialisation(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /** Vérifie le code OTP et enregistre le nouveau mot de passe. */
    @PostMapping("/reinitialiser-mot-de-passe")
    public ResponseEntity<Void> reinitialiserMotDePasse(@Valid @RequestBody ResetPasswordRequest request) {
        otpService.reinitialiserMotDePasse(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
