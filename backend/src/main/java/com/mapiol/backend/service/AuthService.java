package com.mapiol.backend.service;

import com.mapiol.backend.domain.Role;
import com.mapiol.backend.domain.User;
import com.mapiol.backend.exception.ApiException;
import com.mapiol.backend.repository.UserRepository;
import com.mapiol.backend.security.JwtService;
import com.mapiol.backend.security.UserPrincipal;
import com.mapiol.backend.web.dto.AuthResponse;
import com.mapiol.backend.web.dto.LoginRequest;
import com.mapiol.backend.web.dto.RegisterRequest;
import com.mapiol.backend.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inscription et connexion des propriétaires (rôle par défaut à l'inscription publique).
 * Les comptes ADMIN sont créés hors de ce flux (jeu de données initial / back-office).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }

        User user = User.builder()
                .nom(request.nom())
                .prenom(request.prenom())
                .email(request.email().toLowerCase())
                .telephone(request.telephone())
                .telephoneSecondaire(request.telephoneSecondaire())
                .motDePasse(passwordEncoder.encode(request.motDePasse()))
                .role(Role.PROPRIETAIRE)
                .build();

        userRepository.save(user);
        return issueTokens(new UserPrincipal(user));
    }

    public AuthResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.motDePasse()));
        return issueTokens((UserPrincipal) authentication.getPrincipal());
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session invalide"));
        UserPrincipal principal = new UserPrincipal(user);
        if (jwtService.isAccessToken(refreshToken) || !jwtService.isValid(refreshToken, principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Jeton de rafraîchissement invalide");
        }
        return issueTokens(principal);
    }

    private AuthResponse issueTokens(UserPrincipal principal) {
        return new AuthResponse(
                jwtService.generateAccessToken(principal),
                jwtService.generateRefreshToken(principal),
                UserResponse.from(principal.user()));
    }
}
