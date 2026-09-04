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

```bash
# 1. Dépendances (Postgres, MinIO, MailHog)
docker compose up -d

# 2. Backend (http://localhost:8081)
cd backend
./mvnw spring-boot:run

# 3. Frontend (http://localhost:4200)
cd frontend
npm install
npm start
```

## État d'avancement (Phase 1 — socle technique)

- ✅ Backend Spring Boot 4 : configuration, migration Flyway `utilisateurs`, sécurité JWT
  (access + refresh), endpoints `/api/auth/inscription`, `/api/auth/connexion`, `/api/auth/rafraichir`.
- ✅ Frontend Angular 18 SSR : thème Material + Tailwind, session JWT (signals, sûre en SSR),
  écrans Connexion / Inscription / Accueil provisoire.
- ⏳ Non vérifié de bout en bout dans cet environnement : ni Docker ni PostgreSQL natif ne sont
  disponibles ici, donc le backend n'a pas pu être démarré contre une vraie base pour ce build.
  Le backend **compile proprement** (`./mvnw compile` + `test-compile` verts) ; à démarrer et
  tester chez vous avec `docker compose up -d` puis `./mvnw spring-boot:run`.
- ⏳ Prochaine étape (phase 2) : maquettes HTML de l'accueil, de la recherche et de la fiche
  annonce, à valider avant de coder les vraies pages.
