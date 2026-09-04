# Findoor — Plateforme immobilière (location & vente)

Voir le plan complet de conception/réalisation : `~/.claude/plans/glittery-finding-brook.md`
(rédigé sous le nom de travail « MAPIOL » — le nom définitif de l'application est **Findoor**).

## Structure

```
findoor/
  frontend/     Angular 18 (SSR), Angular Material + Tailwind CSS
  backend/      Spring Boot 4 (Java 21), PostgreSQL, Flyway, JWT
  docker-compose.yml   Postgres + MinIO (stockage médias) + MailHog (emails de dev)
```

## Démarrage — développement local

Deux options pour PostgreSQL : Docker (`docker-compose.yml`), ou une instance PostgreSQL déjà
installée en local (créer simplement un rôle/une base `findoor` — voir `application.properties`).

```bash
# 1. Dépendances — au choix :
docker compose up -d                     # Postgres + MinIO + MailHog en conteneurs
# — ou, avec un PostgreSQL déjà installé —
psql -U postgres -c "CREATE ROLE findoor LOGIN PASSWORD 'findoor';"
psql -U postgres -c "CREATE DATABASE findoor OWNER findoor;"

# 2. Backend (http://localhost:8081) — Flyway crée le schéma automatiquement au démarrage
cd backend
./mvnw spring-boot:run

# 3. Frontend (http://localhost:4200) — le port doit rester 4200 (CORS configuré dessus)
cd frontend
npm install
npm start
```

## État d'avancement (Phase 1 — socle technique)

- ✅ Backend Spring Boot 4 (`application.properties`, pas de YAML) : package `com.findoor.backend`,
  migration Flyway `utilisateurs`, sécurité JWT (access + refresh), endpoints
  `/api/auth/inscription`, `/api/auth/connexion`, `/api/auth/rafraichir`.
- ✅ Frontend Angular 18 SSR : thème Material + Tailwind, session JWT (signals, sûre en SSR),
  écrans Connexion / Inscription / Accueil, branding « Findoor ».
- ✅ **Vérifié de bout en bout** contre un vrai PostgreSQL local et dans le navigateur :
  inscription → session active → déconnexion → reconnexion, ainsi que les cas d'erreur
  (mot de passe incorrect → 401, email déjà utilisé → 409).
- ✅ Renommage complet appliqué (2026-09-04) : le projet s'appelait initialement « MAPIOL » —
  nom bien trop proche d'un concurrent camerounais déjà établi, **Mapiole.com** (« la plateforme
  immobilière n°1 au Cameroun », terrains, location, construction, financement). Après vérification
  de disponibilité, le nom **Findoor** a été retenu et appliqué partout : dossier du projet,
  package Java (`com.findoor.backend`), base de données, préfixe de configuration
  (`findoor.*`), branding frontend.
- ⏳ Prochaine étape (phase 2) : maquettes HTML de l'accueil, de la recherche et de la fiche
  annonce — en s'inspirant du meilleur de Mapiole.com (structure de navigation, mise en avant des
  biens, forfaits d'adhésion, police Plus Jakarta Sans, palette magenta/blanc) pour offrir une
  expérience au moins aussi soignée, à valider avant de coder les vraies pages.
