# 🚗 ANTA Backend - API REST Sécurisée

Backend TypeScript/Node.js pour application VTC (Vehicle for Transport Company)

**Version** : 1.5.0  
**Statut** : ✅ Prêt pour développement

---

## 📋 Table des matières

- [Démarrage rapide](#-démarrage-rapide)
- [Configuration](#-configuration)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Authentification](#-authentification)
- [API Documentation](#-api-documentation)
- [Tests](#-tests)
- [Sécurité](#-sécurité)

---

## 🚀 Démarrage rapide

### 1. Prérequis

- Node.js 16+
- MySQL/MariaDB en cours d'exécution
- npm ou yarn

### 2. Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres (voir section Configuration)

# Démarrer le serveur
npm run dev
```

### 3. Vérification

```bash
# Health check
curl http://localhost:4000/api/health

# Register un utilisateur
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+33612345678","name":"Test User","password":"Password123!"}'
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=anta_db

# JWT (IMPORTANT : Changer en production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=*
```

### Base de données

Créer la base de données MySQL :

```sql
CREATE DATABASE anta_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Les tables seront créées automatiquement au premier démarrage via Knex migrations

---

## ✨ Fonctionnalités

### ✅ Implémenté (Étapes 1-3)

- ✅ **Modèles de données** - 11 modèles TypeScript avec BaseModel générique
- ✅ **API REST** - 65 endpoints (58 CRUD + 7 auth)
- ✅ **Authentification JWT** - Register, login, refresh, logout
- ✅ **Autorisation** - Rôles (passenger, driver, admin) + ownership
- ✅ **Sécurité** - Rate limiting, headers sécurité, sanitization
- ✅ **Documentation** - 7 guides + tests HTTP
- ✅ **Tests** - tests.http + tests-auth.http

### 🔄 À venir (Étapes 4+)

- 🔄 Validation des données (Zod/Joi)
- 🔄 Protection routes restantes (drivers, trips, etc.)
- 🔄 Tests unitaires & intégration
- 🔄 WebSocket pour temps réel
- 🔄 Upload de fichiers
- 🔄 Intégrations paiement

---

## 🏗️ Architecture

### Stack technique

```
TypeScript + Node.js + Express
├── Base de données: MySQL + Knex.js
├── Auth: JWT + bcrypt
├── Sécurité: helmet, rate-limit, CORS
└── WebSocket: ws (pour temps réel)
```

### Structure du projet

```
src/
├── models/          # Modèles de données (11 fichiers)
├── controllers/     # Logique métier (6 contrôleurs)
├── routes/          # Définition endpoints (6 fichiers)
├── middleware/      # Middlewares Express (4 fichiers)
├── utils/           # Utilitaires (5 fichiers)
├── config/          # Configuration
├── sockets/         # WebSocket handlers
└── server.ts        # Point d'entrée
```

### Modèles de données

| Modèle | Description | Endpoints |
|--------|-------------|-----------|
| User | Utilisateurs (passagers + base chauffeurs) | 8 |
| Driver | Profils chauffeurs | 13 |
| Trip | Courses | 18 |
| Vehicle | Véhicules | 9 |
| Payment | Paiements | 10 |
| Session | Sessions auth | - |
| Rating | Évaluations | - |
| Wallet | Portefeuilles | - |
| DriverLocation | Localisation temps réel | - |
| Zone | Zones tarifaires | - |
| PromoCode | Codes promo | - |

---

## 🔐 Authentification

### Workflow

```
1. Register → Recevoir tokens
2. Login → Recevoir tokens
3. Requêtes → Authorization: Bearer <accessToken>
4. Token expiré → Refresh avec refreshToken
5. Logout → Révoquer refreshToken
```

### Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /auth/register` | Public | Inscription |
| `POST /auth/login` | Public | Connexion |
| `POST /auth/refresh` | Public | Refresh token |
| `GET /auth/me` | Private | Profil |
| `POST /auth/logout` | Private | Déconnexion |
| `POST /auth/change-password` | Private | Changer MDP |

### Exemple d'utilisation

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33612345678",
    "name": "John Doe",
    "password": "Password123!"
  }'

# Réponse : { "success": true, "data": { "user": {...}, "tokens": { "accessToken": "...", "refreshToken": "..." } } }

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33612345678",
    "password": "Password123!"
  }'

# 3. Utiliser le token pour accéder aux endpoints protégés
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"

# 4. Refresh le token quand il expire
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'
```

### Validation du mot de passe

Le mot de passe doit contenir :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

Exemple valide : `Password123!`

---

## 📚 API Documentation

### Base URL

```
http://localhost:4000/api
```

### Format des réponses

#### Succès
```json
{
  "success": true,
  "data": { ... }
}
```

#### Erreur
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Endpoints principaux

| Ressource | Endpoints | Description |
|-----------|-----------|-------------|
| Health | 1 endpoint | Health check du serveur |
| Auth | 7 endpoints | Authentification et gestion de compte |
| Users | 8 endpoints | Gestion des utilisateurs |
| Drivers | 13 endpoints | Gestion des chauffeurs |
| Trips | 18 endpoints | Gestion des courses |
| Vehicles | 9 endpoints | Gestion des véhicules |
| Payments | 10 endpoints | Gestion des paiements |

**Total** : 66 endpoints disponibles

### Exemples d'endpoints par ressource

#### Users
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour (ownership requis)
- `DELETE /api/users/:id` - Supprimer (Admin)

#### Trips
- `GET /api/trips` - Liste des courses
- `GET /api/trips/:id` - Détails d'une course
- `POST /api/trips` - Créer une course
- `GET /api/trips/pending` - Courses en attente
- `POST /api/trips/:id/assign` - Assigner un chauffeur
- `POST /api/trips/:id/complete` - Compléter une course

#### Drivers
- `GET /api/drivers` - Liste des chauffeurs
- `GET /api/drivers/online` - Chauffeurs en ligne
- `POST /api/drivers` - Créer un profil chauffeur
- `PATCH /api/drivers/:id/status` - Changer le statut

---

## 🧪 Tests

### Option 1 : REST Client (VS Code) - **Recommandé**

1. Installer l'extension "REST Client"
2. Ouvrir `tests.http` ou `tests-auth.http`
3. Cliquer "Send Request"

### Option 2 : Script automatisé

```bash
node test-endpoints.js
```

### Option 3 : Postman

Importer `postman_collection.json`

### Option 4 : cURL

Exemples disponibles directement dans ce README (voir section Authentification)

---

## 🔒 Sécurité

### Implémenté

| Fonctionnalité | Status | Description |
|----------------|--------|-------------|
| JWT Auth | ✅ | Access + refresh tokens |
| Password Hashing | ✅ | bcrypt (10 salt rounds) |
| Password Validation | ✅ | Force obligatoire (8+ chars, majuscule, etc.) |
| Rate Limiting | ✅ | 5/15min auth, 100/15min API |
| Authorization | ✅ | Rôles + ownership |
| Security Headers | ✅ | X-Frame-Options, X-XSS-Protection, etc. |
| CORS | ✅ | Configuré avec origins |
| Input Sanitization | ✅ | Nettoyage automatique |
| Request Logging | ✅ | Dev mode |

### Rôles

- **passenger** : Utilisateur standard (par défaut)
- **driver** : Chauffeur (accès conducteur)
- **admin** : Administrateur (accès complet)

### Rate Limits

| Type | Limite | Fenêtre |
|------|--------|---------|
| Auth | 5 requêtes | 15 minutes |
| API Global | 100 requêtes | 15 minutes |
| Create | 20 requêtes | 1 heure |

---

## 📁 Structure du projet

```
anta-server/
├── src/
│   ├── controllers/     # Logique métier (6 contrôleurs)
│   ├── models/          # Modèles de données (11 modèles)
│   ├── routes/          # Définition des routes (6 fichiers)
│   ├── middleware/      # Middlewares (auth, rate limiting, security)
│   ├── utils/           # Utilitaires (JWT, password, API response)
│   ├── config/          # Configuration
│   ├── sockets/         # WebSocket handlers
│   └── server.ts        # Point d'entrée
├── tests.http           # Tests REST Client (endpoints CRUD)
├── tests-auth.http      # Tests authentification
├── test-endpoints.js    # Tests automatisés
├── .env.example         # Template configuration
└── README.md            # Ce fichier
```

---

## 🛠️ Scripts npm

```bash
# Développement
npm run dev          # Démarrer avec rechargement automatique

# Production
npm start            # Démarrer en mode production
npm run build        # Build TypeScript

# Tests
npm test             # Tests unitaires (à implémenter)
node test-endpoints.js  # Tests automatisés API
```

---

## 📊 Statistiques

### Code
- **Modèles** : 11 fichiers, ~1500 lignes
- **Contrôleurs** : 6 fichiers, ~1600 lignes
- **Routes** : 6 fichiers, ~400 lignes
- **Middlewares** : 4 fichiers, ~400 lignes
- **Utilitaires** : 5 fichiers, ~350 lignes
- **Total** : **~4250 lignes** de code production

### Documentation & Tests
- **Documentation** : 10 fichiers, ~3500 lignes
- **Tests** : 3 fichiers, ~1000 lignes
- **Total** : **~4500 lignes** documentation & tests

### Endpoints
- **Total** : 65 endpoints
  - Auth : 7
  - Users : 8
  - Drivers : 13
  - Trips : 18
  - Vehicles : 9
  - Payments : 10

---

## 🎯 Prochaines étapes

### Court terme
1. Installer les dépendances manquantes : `npm install jsonwebtoken bcrypt express-rate-limit`
2. Configurer `.env` avec `JWT_SECRET`
3. Tester l'authentification avec `tests-auth.http`
4. Protéger les routes restantes (drivers, trips, etc.)

### Moyen terme
1. Validation des données (Zod ou Joi)
2. Tests unitaires (Jest)
3. Tests d'intégration (Supertest)
4. WebSocket pour temps réel

### Long terme
1. CI/CD pipeline
2. Docker configuration
3. Documentation Swagger/OpenAPI
4. Monitoring et logging
5. Déploiement production

---

## 🤝 Contribution

Le projet est en développement actif. Structure et patterns établis :

- TypeScript strict mode
- Architecture MVC
- Réponses API standardisées
- Gestion d'erreurs centralisée
- Documentation complète

---

## 📝 License

Propriétaire - ANTA Project

---

## 🎉 Remerciements

Backend ANTA développé avec :
- Express.js
- TypeScript
- Knex.js
- JWT
- bcrypt
- Et beaucoup de ☕

---

**Prêt à démarrer ? Consultez [QUICK_START.md](./QUICK_START.md) !** 🚀
