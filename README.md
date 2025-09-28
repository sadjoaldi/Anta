# ANTA - Réservation de Taxi Moto (Guinée)

ANTA est une application mobile de réservation de taxi moto dédiée à la Guinée.

## Stack
- Mobile: React Native (Expo) — TypeScript
- Web (Admin): React + Vite — TypeScript + Tailwind CSS
- Backend: Node.js (Express) — TypeScript
- Base de données: Knex (Query Builder) avec MySQL (mysql2) par défaut

## Structure du projet (Monorepo)
```
ANTA/
  packages/
    backend/               # Serveur Node.js (TS) + API REST + Knex (MySQL)
    frontend/
      mobile/              # Application mobile Expo (TS)
      web/                 # Dashboard admin (Vite + React + Tailwind)
  package.json             # Scripts racine pour lancer chaque app
  README.md
```

## Démarrage

Depuis la racine du repo (`ANTA/`):

- Installer toutes les dépendances des 3 apps:
```
npm run install:all
```

- Lancer le backend (API):
```
npm run dev:backend
```

- Lancer le dashboard web (Vite):
```
npm run dev:web
```

- Lancer l’app mobile (Expo):
```
npm run dev:mobile
```

### Détails par package

#### Backend (`packages/backend`)
```
cd packages/backend
copy .env.example .env    # Windows
# ou: cp .env.example .env

# Par défaut: MySQL (mysql2). Renseignez MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE.

# Exécuter les migrations (création des tables)
npx knex migrate:latest --knexfile knexfile.ts

# Lancer en dev (TypeScript)
npx ts-node-dev --respawn --transpile-only src/server.ts

# Ou build + start
npm run build
npm start
```

#### Mobile (`packages/frontend/mobile`)
```
cd packages/frontend/mobile
# .env (exemple):
# EXPO_PUBLIC_API_URL=http://VOTRE_IP_LOCALE:4000
npx expo start -c
```

#### Web Admin (`packages/frontend/web`)
```
cd packages/frontend/web
npm run dev
# Ouvrez l’URL affichée (ex: http://localhost:5173)
```

## Variables d'environnement (serveur)
Voir `packages/backend/.env.example`.
- DB_CLIENT=mysql2 (par défaut)
- MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
- (Option) PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE si DB_CLIENT=pg
- (Option) SQLITE_FILE si DB_CLIENT=sqlite3
- CORS_ORIGIN, PORT

## API de base
- `GET /api/health` — statut du serveur
- `POST /api/auth/login` — mock d’auth (phone)
- `POST /api/rides` — créer une course `{ riderId, pickup{lat,lng}, dropoff{lat,lng} }`
- `GET /api/rides/:id` — consulter une course
- `GET /api/drivers` — liste (simplifiée) des chauffeurs disponibles

## Notes TypeScript & Typages
- Mobile: Expo Router, TypeScript, icônes Ionicons.
- Web: Vite + React + Tailwind. Routage `react-router-dom`.
- Serveur: code en `src/*.ts`, build vers `dist/`.

## Query Builder (Knex)
- Migrations TypeScript dans `packages/backend/migrations/`.
- Repositories dans `packages/backend/src/repositories/` (users, drivers, rides).
- MySQL (mysql2) par défaut; Postgres ou SQLite activables via `.env`.

## Fonctionnalités prévues
- Inscription/connexion (numéro de téléphone + OTP ou mock au début)
- Carte pour localiser l’utilisateur et les chauffeurs
- Création de course (point de départ, destination, prix estimé)
- Appairage passager-chauffeur (temps réel via WebSocket)
- Historique des courses

## Roadmap
- v0: MVP avec réservation simple et suivi basique
- v1: Authentification OTP, tarification, états de course
- v2: Paiements, notes, amélioration UX/UI

