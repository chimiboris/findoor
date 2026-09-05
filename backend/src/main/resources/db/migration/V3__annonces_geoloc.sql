-- Phase 3 (suite) : position GPS approximative de chaque annonce, pour la carte interactive cliquable.
ALTER TABLE annonces
    ADD COLUMN latitude  DOUBLE PRECISION,
    ADD COLUMN longitude DOUBLE PRECISION;
