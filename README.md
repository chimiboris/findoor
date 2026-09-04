# MAPIOL — Plateforme immobilière (location & vente)

Voir le plan complet de conception/réalisation : `~/.claude/plans/glittery-finding-brook.md`.

## Structure

```
mapiol/
  frontend/     Angular 18 (SSR), Angular Material + Tailwind CSS
  backend/      Spring Boot 4 (Java 21), PostgreSQL, Flyway, JWT
  docker-compose.yml   Postgres + MinIO (stockage médias) + MailHog (emails de dev)
```

## Démarrage — développement local

Deux options pour PostgreSQL : Docker (`docker-compose.yml`), ou une instance PostgreSQL déjà
installée en local (créer simplement un rôle/une base `mapiol` — voir `application.yml`).

```bash
# 1. Dépendances — au choix :
docker compose up -d                     # Postgres + MinIO + MailHog en conteneurs
# — ou, avec un PostgreSQL déjà installé —
psql -U postgres -c "CREATE ROLE mapiol LOGIN PASSWORD 'mapiol';"
psql -U postgres -c "CREATE DATABASE mapiol OWNER mapiol;"

# 2. Backend (http://localhost:8081) — Flyway crée le schéma automatiquement au démarrage
cd backend
./mvnw spring-boot:run

# 3. Frontend (http://localhost:4200) — le port doit rester 4200 (CORS configuré dessus)
cd frontend
npm install
npm start
```

## État d'avancement (Phase 1 — socle technique)

- ✅ Backend Spring Boot 4 : configuration, migration Flyway `utilisateurs`, sécurité JWT
  (access + refresh), endpoints `/api/auth/inscription`, `/api/auth/connexion`, `/api/auth/rafraichir`.
- ✅ Frontend Angular 18 SSR : thème Material + Tailwind, session JWT (signals, sûre en SSR),
  écrans Connexion / Inscription / Accueil provisoire.
- ✅ **Vérifié de bout en bout** contre un vrai PostgreSQL local et dans le navigateur :
  inscription → session active → déconnexion → reconnexion, ainsi que les cas d'erreur
  (mot de passe incorrect → 401, email déjà utilisé → 409). Corrections apportées pendant ce
  test : l'indicateur de santé `mail` (MailHog non démarré) ne fait plus tomber
  `/actuator/health` en dev, et les erreurs réseau/serveur ne sont plus confondues avec des
  erreurs métier côté frontend (`core/utils/http-error.util.ts`).
- ⏳ Prochaine étape (phase 2) : maquettes HTML de l'accueil, de la recherche et de la fiche
  annonce, à valider avant de coder les vraies pages.
