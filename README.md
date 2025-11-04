# 🚗 ANTA - Plateforme VTC Guinée

> **Application complète de VTC (Véhicule de Tourisme avec Chauffeur) pour le marché guinéen**

[![Status](https://img.shields.io/badge/status-MVP%20Ready-success)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-Proprietary-red)]()

ANTA est une plateforme moderne et complète de réservation de courses, offrant une expérience fluide pour passagers et chauffeurs avec tracking GPS en temps réel, système d'avis, et sécurité maximale.

## ✨ Features

- 🚗 **Réservation instantanée** - Trouvez un chauffeur en quelques secondes
- 📍 **Tracking GPS temps réel** - Suivez votre course en direct
- ⭐ **Système d'avis complet** - Notes détaillées + badges automatiques
- 🔒 **Sécurité maximale** - Partage de course, infos chauffeur vérifiées
- 💰 **Prix transparents** - Tarification claire avant réservation
- 📱 **Interface moderne** - UX intuitive et responsive

## 🛠️ Stack Technique

### Backend
- **Runtime:** Node.js 18+ avec TypeScript
- **Framework:** Express.js 4.x
- **Base de données:** MySQL 8+ / MariaDB 10+
- **ORM:** Knex.js (Query Builder + Migrations)
- **Auth:** JWT (access + refresh tokens)
- **APIs:** Google Maps (Directions, Geocoding, Places)

### Frontend Mobile
- **Framework:** React Native + Expo SDK 51
- **Langage:** TypeScript
- **Navigation:** Expo Router (file-based)
- **Maps:** react-native-maps (Google Maps)
- **HTTP:** Axios avec intercepteurs JWT

### Frontend Web (Dashboard Admin)
- **Framework:** React 19 + Vite 7
- **UI:** Shadcn/ui + Tailwind CSS + Radix UI
- **Charts:** Recharts
- **État:** ✅ Implémenté à 80%

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

## 📖 Documentation

- **[Documentation Complète](./DOCUMENTATION.md)** - Vue d'ensemble du projet
- **[Backend API](./docs/BACKEND.md)** - Documentation technique backend
- **[Mobile App](./docs/MOBILE.md)** - Documentation technique mobile
- **[Dashboard Web](./docs/WEB.md)** - Documentation dashboard admin
- **[Roadmap](./docs/ROADMAP.md)** - Feuille de route détaillée

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- MySQL 8+ ou MariaDB 10+
- Expo CLI (`npm install -g expo-cli`)
- Compte Google Maps API (avec clé API)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-org/anta.git
cd ANTA
```

2. **Installer les dépendances**
```bash
npm run install:all
```

3. **Configuration Backend**
```bash
cd packages/backend/anta-server
cp .env.example .env
# Éditer .env avec vos credentials
```

4. **Créer la base de données**
```bash
mysql -u root -p
CREATE DATABASE anta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Exécuter les migrations**
```bash
npm run migrate:latest
```

6. **Lancer le backend**
```bash
npm run dev
```

7. **Lancer l'app mobile**
```bash
cd packages/frontend/mobile
npm start
```

## 🔑 API Routes Principales

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir token

### Rides
- `POST /api/rides/create` - Créer course
- `GET /api/rides/passenger/:id/active` - Course active passager
- `POST /api/rides/:id/accept` - Accepter course (chauffeur)
- `POST /api/rides/:id/start` - Démarrer course
- `POST /api/rides/:id/complete` - Terminer course

### Drivers
- `GET /api/drivers/available` - Chauffeurs disponibles
- `PUT /api/drivers/:id/location` - Mettre à jour position GPS
- `GET /api/drivers/:id` - Détails chauffeur

### Reviews
- `POST /api/reviews` - Créer avis
- `GET /api/reviews/user/:id/stats` - Statistiques utilisateur
- `GET /api/reviews/user/:id/badges` - Badges automatiques

### Directions
- `POST /api/directions/route` - Calculer itinéraire
- `POST /api/directions/autocomplete` - Autocomplétion adresses

[📖 Documentation API complète](./docs/BACKEND.md)

## 🏗️ Architecture

```
┌─────────────────────────┐
│    Mobile App (Expo)    │
│  Passagers + Chauffeurs │
└───────────┬─────────────┘
            │ REST API
            ↓
┌─────────────────────────┐
│   Backend (Express)     │
│  Node.js + TypeScript   │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│   MySQL Database        │
│   (MariaDB compatible)  │
└─────────────────────────┘
```

## ✅ Features Implémentées

### ✅ Phase 1 - MVP (Complète)

**Authentification**
- [x] Inscription passager/chauffeur
- [x] Connexion JWT
- [x] Refresh token automatique
- [x] Déconnexion

**Réservation & Courses**
- [x] Recherche origine/destination
- [x] Calcul itinéraire Google Directions
- [x] Liste chauffeurs disponibles
- [x] Création course
- [x] Acceptation/Refus chauffeur
- [x] Annulation course
- [x] Historique complet

**Chauffeurs**
- [x] Dashboard chauffeur
- [x] Toggle online/offline
- [x] Tracking GPS automatique
- [x] Liste courses en attente
- [x] Statistiques (courses, gains, note)

**Sécurité & Transparence**
- [x] Modale détails chauffeur
- [x] Infos véhicule vérifiées
- [x] Partage course (SMS/WhatsApp)
- [x] Bouton appeler chauffeur
- [x] Tracking temps réel

**Système d'Avis**
- [x] Notation 5 étoiles + 4 catégories
- [x] Badges automatiques
- [x] Commentaires et tags
- [x] Statistiques détaillées

**Géolocalisation**
- [x] Position actuelle GPS
- [x] Recherche adresse (autocomplete)
- [x] Géocodage/Géocodage inversé
- [x] Calcul distance/durée/prix

## 🎯 Prochaines Étapes

### Phase 2 - En cours

- [ ] Notifications Push (Expo)
- [ ] WebSocket temps réel
- [ ] Paiements mobiles (Orange/MTN Money)
- [ ] Sécurité avancée (SOS, Code PIN)

[📖 Voir roadmap complète](./docs/ROADMAP.md)

## 📝 Variables d'Environnement

### Backend (.env)
```bash
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=anta
DB_USER=anta_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Google Maps
GOOGLE_MAPS_API_KEY=your-api-key
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.35:4000/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

## 🧪 Tests

```bash
# Backend
cd packages/backend/anta-server
npm test
npm run test:coverage

# Mobile
cd packages/frontend/mobile
npm test
```

## 📦 Déploiement

### Backend
```bash
# Build
npm run build

# Production
NODE_ENV=production npm start
```

### Mobile
```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Submit
eas submit --platform all
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Proprietary - Tous droits réservés

## 👥 Équipe

- **Lead Developer** - [Votre Nom]
- **Backend** - [Équipe Backend]
- **Mobile** - [Équipe Mobile]

## 📧 Contact

- **Email:** contact@anta.gn
- **Website:** https://anta.gn
- **Support:** support@anta.gn

---

⭐ **Fait avec ❤️ pour la Guinée**
