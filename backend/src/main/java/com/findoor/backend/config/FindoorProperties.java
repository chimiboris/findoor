package com.findoor.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Liaison typée des propriétés applicatives sous le préfixe {@code findoor.*} (application.properties). */
@ConfigurationProperties(prefix = "findoor")
public record FindoorProperties(Jwt jwt, Cors cors, Storage storage, Payment payment) {

    public record Jwt(String secret, long accessTokenMinutes, long refreshTokenDays) {}

    public record Cors(String allowedOrigins) {}

    public record Storage(String endpoint, String bucket, String accessKey, String secretKey, String localDir) {}

    public record Payment(String provider, CinetPay cinetpay) {
        public record CinetPay(String siteId, String apiKey, String notifyUrl, String returnUrl) {}
    }
}
