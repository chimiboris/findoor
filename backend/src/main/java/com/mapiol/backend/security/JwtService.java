package com.mapiol.backend.security;

import com.mapiol.backend.config.MapiolProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Émission et validation des jetons JWT (access + refresh). */
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final MapiolProperties properties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserPrincipal principal) {
        return buildToken(principal, TYPE_ACCESS, properties.jwt().accessTokenMinutes(), ChronoUnit.MINUTES);
    }

    public String generateRefreshToken(UserPrincipal principal) {
        return buildToken(principal, TYPE_REFRESH, properties.jwt().refreshTokenDays(), ChronoUnit.DAYS);
    }

    private String buildToken(UserPrincipal principal, String type, long amount, ChronoUnit unit) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(principal.getUsername())
                .claim(CLAIM_ROLE, principal.user().getRole().name())
                .claim(CLAIM_TYPE, type)
                .claim("uid", principal.id())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(amount, unit)))
                .signWith(signingKey())
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isAccessToken(String token) {
        return TYPE_ACCESS.equals(parseClaims(token).get(CLAIM_TYPE, String.class));
    }

    public boolean isValid(String token, UserPrincipal principal) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(principal.getUsername()) && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token).getPayload();
    }
}
