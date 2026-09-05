-- Le paiement passe d'un modèle "par annonce" à un modèle "par période d'abonnement propriétaire" :
-- un propriétaire paie pour une durée d'accès, valable pour TOUTES ses annonces à la fois.
ALTER TABLE utilisateurs ADD COLUMN date_acces_expire DATE;

ALTER TABLE paiements DROP COLUMN annonce_id;

ALTER TABLE annonces DROP COLUMN date_publication_expire;
