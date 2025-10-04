# 🔧 Fix : Création automatique du profil driver

## Problème identifié

Lors de l'inscription avec `role: "driver"`, seul l'utilisateur était créé dans la table `users`, mais aucun profil n'était créé dans la table `drivers`.

## Solution implémentée

Maintenant, lors du register avec `role: "driver"`, le système crée automatiquement :
1. ✅ L'utilisateur dans la table `users`
2. ✅ Le profil driver dans la table `drivers`

### Code modifié

`src/controllers/authController.ts` - fonction `register`

```typescript
// If registering as driver, create driver profile automatically
if (role === 'driver') {
  await Driver.create({
    user_id: user.id,
    status: 'offline',
    kyc_status: 'pending',
    rating: 5.0,
    total_trips: 0
  });
}
```

## Test

```bash
# 1. Register un driver
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33687654321",
    "name": "Test Driver",
    "password": "Password123!",
    "role": "driver"
  }'

# Récupérer l'ID du user dans la réponse, puis :

# 2. Vérifier que le profil driver existe
curl http://localhost:4000/api/drivers/user/2
```

## Valeurs par défaut du profil driver

Lors de la création automatique, le driver a :
- `status`: `offline` (doit se connecter pour passer online)
- `kyc_status`: `pending` (en attente de vérification documents)
- `rating`: `5.0` (note de départ)
- `total_trips`: `0` (aucune course effectuée)

## Workflow complet

### Pour un passager
```bash
POST /auth/register
{
  "phone": "+33612345678",
  "name": "John Passenger",
  "password": "Password123!"
  // role: "passenger" est le défaut
}
```
→ Crée seulement l'utilisateur

### Pour un chauffeur
```bash
POST /auth/register
{
  "phone": "+33687654321",
  "name": "Bob Driver",
  "password": "Password123!",
  "role": "driver"
}
```
→ Crée l'utilisateur ET le profil driver

### Compléter le profil driver ensuite

```bash
# Ajouter licence, véhicule, documents KYC, etc.
PUT /drivers/:id
{
  "license_number": "ABC123456",
  "kyc_status": "approved"
}
```

## Avantages

✅ Une seule requête pour créer un driver complet  
✅ Pas besoin de deux étapes (register puis créer driver)  
✅ Cohérence des données garantie  
✅ Meilleure expérience utilisateur  

## Note

Ce fichier peut être supprimé après lecture - c'est juste une note explicative du fix.
