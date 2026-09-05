ALTER TABLE annonces ADD COLUMN date_publication_expire DATE;

CREATE TABLE paiements (
    id BIGSERIAL PRIMARY KEY,
    annonce_id BIGINT NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
    owner_user_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    formule VARCHAR(30) NOT NULL,
    moyen VARCHAR(20) NOT NULL,
    montant BIGINT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    reference VARCHAR(60) NOT NULL UNIQUE,
    date_creation TIMESTAMP NOT NULL DEFAULT now(),
    date_confirmation TIMESTAMP
);

CREATE INDEX idx_paiements_annonce ON paiements(annonce_id);
CREATE INDEX idx_paiements_owner ON paiements(owner_user_id);
