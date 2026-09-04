-- Phase 1 : socle utilisateurs (visiteur inscrit / propriétaire / admin).
-- Les tables du domaine annonces/paiement/média arrivent aux phases 3 et 4.

CREATE TABLE utilisateurs (
    id                  BIGSERIAL PRIMARY KEY,
    nom                 VARCHAR(100)        NOT NULL,
    prenom              VARCHAR(100)        NOT NULL,
    email               VARCHAR(180)        NOT NULL,
    telephone           VARCHAR(30)         NOT NULL,
    telephone_secondaire VARCHAR(30),
    mot_de_passe        VARCHAR(255)        NOT NULL,
    role                VARCHAR(20)         NOT NULL,
    actif               BOOLEAN             NOT NULL DEFAULT TRUE,
    email_verifie       BOOLEAN             NOT NULL DEFAULT FALSE,
    date_creation       TIMESTAMP           NOT NULL DEFAULT now(),
    date_maj            TIMESTAMP           NOT NULL DEFAULT now(),

    CONSTRAINT uq_utilisateurs_email UNIQUE (email),
    CONSTRAINT ck_utilisateurs_role CHECK (role IN ('VISITEUR', 'PROPRIETAIRE', 'ADMIN'))
);

CREATE INDEX idx_utilisateurs_role ON utilisateurs (role);
