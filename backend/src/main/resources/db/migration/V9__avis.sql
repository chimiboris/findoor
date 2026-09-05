CREATE TABLE avis (
    id BIGSERIAL PRIMARY KEY,
    annonce_id BIGINT NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
    annonce_titre VARCHAR(255) NOT NULL,
    nom VARCHAR(120) NOT NULL,
    email VARCHAR(180),
    note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    date_creation TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_avis_annonce ON avis(annonce_id);
CREATE INDEX idx_avis_statut ON avis(statut);
