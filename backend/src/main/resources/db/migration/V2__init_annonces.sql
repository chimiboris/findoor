-- Phase 3 : annonces (location + vente), rattachées optionnellement à un propriétaire réel.

CREATE TABLE annonces (
    id                  BIGSERIAL PRIMARY KEY,
    transaction         VARCHAR(20)   NOT NULL,
    type                VARCHAR(40)   NOT NULL,
    meuble              BOOLEAN,
    region              VARCHAR(60)   NOT NULL,
    departement         VARCHAR(60)   NOT NULL,
    ville               VARCHAR(60)   NOT NULL,
    quartier            VARCHAR(100)  NOT NULL,
    prix                BIGINT        NOT NULL,
    unite               VARCHAR(20),
    unite_m2            BOOLEAN       NOT NULL DEFAULT FALSE,
    prix_total          BIGINT,
    titre               VARCHAR(200)  NOT NULL,
    surface             INTEGER       NOT NULL,
    pieces              INTEGER,
    chambres            INTEGER,
    description         TEXT          NOT NULL,
    owner_nom           VARCHAR(150)  NOT NULL,
    owner_initials      VARCHAR(4)    NOT NULL,
    owner_user_id       BIGINT REFERENCES utilisateurs (id),
    vedette             BOOLEAN       NOT NULL DEFAULT FALSE,
    actif               BOOLEAN       NOT NULL DEFAULT TRUE,
    date_creation       TIMESTAMP     NOT NULL DEFAULT now(),
    date_maj            TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT ck_annonces_transaction CHECK (transaction IN ('louer', 'acheter'))
);

CREATE INDEX idx_annonces_transaction ON annonces (transaction);
CREATE INDEX idx_annonces_region ON annonces (region);
CREATE INDEX idx_annonces_type ON annonces (type);
CREATE INDEX idx_annonces_owner_user ON annonces (owner_user_id);
CREATE INDEX idx_annonces_vedette ON annonces (vedette);

CREATE TABLE annonce_equipements (
    annonce_id  BIGINT       NOT NULL REFERENCES annonces (id) ON DELETE CASCADE,
    equipement  VARCHAR(120) NOT NULL
);

CREATE INDEX idx_annonce_equipements_annonce ON annonce_equipements (annonce_id);

CREATE TABLE annonce_photos (
    annonce_id  BIGINT       NOT NULL REFERENCES annonces (id) ON DELETE CASCADE,
    position    INTEGER      NOT NULL DEFAULT 0,
    url         VARCHAR(500) NOT NULL
);

CREATE INDEX idx_annonce_photos_annonce ON annonce_photos (annonce_id);
