# 🚀 OTP System - Guide de Démarrage Rapide

## ✅ Étape 1 : Backend Setup (5 minutes)

### 1.1 Configurer l'environnement

```bash
cd packages/backend/anta-server

# Copier l'exemple d'environnement si .env n'existe pas
cp .env.example .env
```

### 1.2 Ajouter le mode bypass dans `.env`

Ouvrir `.env` et ajouter/modifier :

```bash
# OTP Configuration - MODE DÉVELOPPEMENT
DEV_BYPASS_OTP=true
```

**Important** : Avec `DEV_BYPASS_OTP=true`, le code **1234** fonctionnera toujours !

### 1.3 Exécuter la migration

```bash
npm run migrate:latest
```

**Attendu :**
```
✅ Batch 1 run: 1 migrations
✅ Migration 20251009_000001_add_otp_system.ts executed
```

### 1.4 Redémarrer le serveur

```bash
npm run dev
```

**Attendu :**
```
🚀 ANTA server listening on port 4000
📝 Environment: development  
🔒 Security headers enabled   
⏱️  Rate limiting enabled  
✅ DB connected (Knex)
```

---

## ✅ Étape 2 : Tester les Endpoints (2 minutes)

### Test 1 : Send OTP

```bash
curl -X POST http://localhost:4000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224622000000",
    "purpose": "registration"
  }'
```

**Attendu (en mode dev) :**
```
🔧 DEV MODE: OTP bypass enabled. Code: 1234 for +224622000000
```

**Réponse JSON :**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresIn": 300
  }
}
```

### Test 2 : Verify OTP

```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+224622000000",
    "code": "1234",
    "purpose": "registration"
  }'
```

**Réponse JSON :**
```json
{
  "success": true,
  "data": {
    "message": "OTP verified successfully",
    "verified": true
  }
}
```

---

## ✅ Étape 3 : Tester l'App Mobile (5 minutes)

### 3.1 Lancer l'app mobile

```bash
cd packages/frontend/mobile
npm start
```

Puis appuie sur `a` (Android) ou `i` (iOS)

### 3.2 Tester le flow complet

1. **Welcome Screen** → Clic sur "S'inscrire"
2. **Register** → Remplis :
   - Nom : `Test User`
   - Téléphone : `+224622000000`
   - Email : `test@example.com` (optionnel)
   - Clic sur "Continuer"

3. **OTP Screen** → Saisis : `1234`
   - ✅ Auto-validation après 4 chiffres
   - ✅ Message : "Vérification réussie"

4. **Complete Profile** → Saisis :
   - Mot de passe : `Password123`
   - Confirmer : `Password123`
   - ✅ Coche la case CGU
   - Clic sur "Créer mon compte"

5. **Onboarding** → 3 slides
   - Tu peux "Passer" ou parcourir
   - Clic sur "C'est parti !"

6. **Home** → Tu es connecté ! 🎉

---

## 🎯 Modes de Fonctionnement

### Mode 1 : Développement (Actuel)

```bash
# .env
DEV_BYPASS_OTP=true
```

✅ **Avantages :**
- Code `1234` fonctionne toujours
- Pas besoin de SMS
- Parfait pour dev hors Guinée
- Tests rapides

⚠️ **Log dans le terminal :**
```
🔧 DEV MODE: OTP bypass enabled. Code: 1234 for +224622000000
```

### Mode 2 : Production (Plus tard)

```bash
# .env
DEV_BYPASS_OTP=false

# Ajouter SMS Provider
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

✅ **Comportement :**
- Code aléatoire généré
- SMS envoyé via Twilio/AfricasTalking
- Sécurité maximale

---

## 📊 Vérification Base de Données

### Vérifier les tables créées

```sql
-- Nouvelle colonne dans users
SELECT phone, phone_verified, phone_verified_at 
FROM users 
LIMIT 5;

-- Table OTP codes
SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 5;
```

### Vérifier un OTP envoyé

```sql
SELECT 
  phone, 
  code, 
  purpose, 
  attempts,
  expires_at,
  verified_at,
  created_at
FROM otp_codes
WHERE phone = '+224622000000'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🐛 Troubleshooting

### Problème 1 : "Migration already exists"

```bash
# Rollback puis re-migrate
npm run migrate:rollback
npm run migrate:latest
```

### Problème 2 : "Too many requests"

Le rate limiter bloque (20 tentatives/15min). Solutions :
- Attends 15 minutes
- Redémarre le serveur (reset en mémoire)
- Utilise un autre numéro

### Problème 3 : "Invalid or expired OTP"

- OTP expire après 5 minutes
- Demande un nouveau code (bouton "Renvoyer")
- En dev, assure-toi que `DEV_BYPASS_OTP=true`

### Problème 4 : Erreur 404 sur `/auth/send-otp`

- Vérifie que le serveur est bien redémarré
- Vérifie l'URL : `http://localhost:4000/api/auth/send-otp`
- Vérifie les logs du serveur

---

## 📱 Flux Mobile Complet

```
┌─────────────────────────────────────────────────────┐
│                   WELCOME SCREEN                     │
│  • S'inscrire / Se connecter                        │
└─────────────────────────────────────────────────────┘
                        ↓ (S'inscrire)
┌─────────────────────────────────────────────────────┐
│                  REGISTER SCREEN                     │
│  • Nom complet                                       │
│  • Téléphone (+224...)                              │
│  • Email (optionnel)                                │
│  • [Continuer] → sendOTP() ✉️                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                   OTP SCREEN                         │
│  • 4 inputs (code)                                  │
│  • Timer 60s                                        │
│  • [Auto-verify] → verifyOTP() ✅                   │
│  • [Renvoyer] → sendOTP() 🔄                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              COMPLETE PROFILE SCREEN                 │
│  • Mot de passe                                     │
│  • Confirmer mot de passe                           │
│  • Checkbox CGU                                     │
│  • [Créer compte] → register() 🎉                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                ONBOARDING (3 slides)                 │
│  • Réservation / Suivi / Paiement                  │
│  • [Passer] ou [Suivant] → [C'est parti !]         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                    HOME SCREEN                       │
│              🎉 Utilisateur connecté !              │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Finale

Avant de passer à la suite (Home Screen Mobile) :

- [ ] Migration exécutée (`otp_codes` table créée)
- [ ] `DEV_BYPASS_OTP=true` dans `.env`
- [ ] Backend redémarré (port 4000)
- [ ] Endpoint `/auth/send-otp` testé (curl)
- [ ] Endpoint `/auth/verify-otp` testé (curl)
- [ ] App mobile testée (flow complet)
- [ ] Code `1234` accepté
- [ ] Compte créé avec succès
- [ ] Onboarding affiché
- [ ] Arrivée sur Home

**Si tout est ✅, tu es prêt pour l'Option 2 : Home Screen Mobile ! 🚀**

---

## 📚 Documentation Complète

Pour plus de détails, consulte :
- `packages/backend/anta-server/OTP_SETUP.md` - Configuration OTP complète
- `packages/backend/anta-server/.env.example` - Variables d'environnement
- `packages/backend/anta-server/src/services/otp.service.ts` - Code OTP
