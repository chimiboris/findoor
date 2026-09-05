package com.findoor.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Limitation de débit en mémoire (phase 7 — durcissement sécurité) pour les routes publiques non
 * authentifiées les plus exposées aux abus (connexion/inscription — force brute — et dépôt de
 * contenu par des visiteurs sans compte — spam). Fenêtre glissante simplifiée par minute, par IP.
 *
 * <p>Volontairement en mémoire (pas de Redis) : ce projet vise un hébergement gratuit mono-instance
 * (voir le guide de déploiement) où un stockage partagé serait un coût/complexité inutile — cette
 * protection ne survit pas à un redémarrage ni à plusieurs instances, ce qui est un compromis
 * acceptable pour la volumétrie visée.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    /** (préfixe de route, limite par minute) — la première correspondance de préfixe s'applique. */
    private static final List<Map.Entry<String, Integer>> LIMITES = List.of(
            Map.entry("/api/auth/connexion", 10),
            Map.entry("/api/auth/inscription", 5),
            Map.entry("/api/auth/mot-de-passe-oublie", 5),
            Map.entry("/api/auth/reinitialiser-mot-de-passe", 5),
            Map.entry("/api/public/alertes", 5),
            Map.entry("/api/public/annonces", 10) // couvre .../{id}/messages et .../{id}/avis (POST)
            );

    private final Map<String, AtomicInteger> compteurs = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        Map.Entry<String, Integer> regle = LIMITES.stream().filter(e -> path.startsWith(e.getKey())).findFirst().orElse(null);

        if (regle == null) {
            chain.doFilter(request, response);
            return;
        }

        int limite = regle.getValue();
        String cle = clientIp(request) + "|" + regle.getKey() + "|" + (Instant.now().getEpochSecond() / 60);
        int compte = compteurs.computeIfAbsent(cle, k -> new AtomicInteger()).incrementAndGet();

        if (compte > limite) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"statut\":429,\"message\":\"Trop de requêtes — merci de réessayer dans une minute.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    /** Purge toutes les 10 minutes — évite une croissance non bornée sur une instance longue durée. */
    @Scheduled(fixedRate = 10 * 60 * 1000L)
    void purger() {
        compteurs.clear();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
