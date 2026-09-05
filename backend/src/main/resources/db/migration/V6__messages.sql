CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    annonce_id BIGINT NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
    annonce_titre VARCHAR(255) NOT NULL,
    destinataire_user_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    expediteur_nom VARCHAR(120) NOT NULL,
    expediteur_email VARCHAR(180) NOT NULL,
    expediteur_telephone VARCHAR(30),
    contenu TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_destinataire ON messages(destinataire_user_id);
CREATE INDEX idx_messages_annonce ON messages(annonce_id);
