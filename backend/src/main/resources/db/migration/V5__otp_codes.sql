-- Codes OTP pour la réinitialisation de mot de passe (email ou téléphone), utilisateurs et admin.
CREATE TABLE otp_codes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES utilisateurs (id) ON DELETE CASCADE,
    code            VARCHAR(10)  NOT NULL,
    canal           VARCHAR(10)  NOT NULL,
    utilise         BOOLEAN      NOT NULL DEFAULT FALSE,
    date_expiration TIMESTAMP    NOT NULL,
    date_creation   TIMESTAMP    NOT NULL DEFAULT now(),

    CONSTRAINT ck_otp_canal CHECK (canal IN ('EMAIL', 'SMS'))
);

CREATE INDEX idx_otp_user ON otp_codes (user_id);
