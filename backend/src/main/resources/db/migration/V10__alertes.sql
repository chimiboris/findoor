CREATE TABLE alertes (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(180) NOT NULL,
    transaction VARCHAR(20) NOT NULL,
    region VARCHAR(60),
    departement VARCHAR(60),
    arrondissement VARCHAR(60),
    quartier VARCHAR(100),
    meuble_oui BOOLEAN NOT NULL DEFAULT FALSE,
    meuble_non BOOLEAN NOT NULL DEFAULT FALSE,
    prix_min BIGINT,
    prix_max BIGINT,
    token VARCHAR(60) NOT NULL UNIQUE,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT now(),
    derniere_verification TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE alerte_types (
    alerte_id BIGINT NOT NULL REFERENCES alertes(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL
);

CREATE INDEX idx_alertes_actif ON alertes(actif);
CREATE INDEX idx_alerte_types_alerte ON alerte_types(alerte_id);
