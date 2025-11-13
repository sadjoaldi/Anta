# 📤 Upload de Documents KYC

## Endpoint

```
POST /api/drivers/:id/documents/upload
```

## Authentification

- **Bearer Token** requis
- **Permissions:** Driver (propres documents) ou Admin (tous les documents)

## Request

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

### Body (multipart/form-data)

Les champs suivants sont acceptés (tous optionnels, au moins 1 requis):

| Field Name | Type | Max Size | Description |
|------------|------|----------|-------------|
| `photo_profil` | File | 5 MB | Photo de profil du chauffeur |
| `photo_cni_recto` | File | 5 MB | CNI - Recto |
| `photo_cni_verso` | File | 5 MB | CNI - Verso |
| `photo_permis_recto` | File | 5 MB | Permis de conduire - Recto |
| `photo_permis_verso` | File | 5 MB | Permis de conduire - Verso |
| `photo_carte_grise` | File | 5 MB | Carte grise du véhicule |
| `photo_vehicule` | File | 5 MB | Photo du véhicule |

**Formats acceptés:** JPG, JPEG, PNG, WebP

## Response Success (200)

```json
{
  "success": true,
  "data": {
    "driver": {
      "id": 1,
      "user_id": 5,
      "kyc_status": "pending",
      "kyc_documents": "{\"photo_profil\":\"http://localhost:4000/uploads/kyc/driver_1_photo_profil_1699123456789.jpg\",...}",
      ...
    },
    "documents": {
      "photo_profil": "http://localhost:4000/uploads/kyc/driver_1_photo_profil_1699123456789.jpg",
      "photo_cni_recto": "http://localhost:4000/uploads/kyc/driver_1_photo_cni_recto_1699123456790.jpg",
      ...
    },
    "uploaded": ["photo_profil", "photo_cni_recto", ...],
    "kyc_complete": true
  },
  "message": "Documents uploaded successfully"
}
```

## Comportement

### Upload partiel
- Vous pouvez uploader les documents un par un ou tous ensemble
- Les nouveaux documents remplacent les anciens pour le même champ
- Les documents existants non uploadés sont conservés

### Changement automatique du statut KYC
- Si **tous les 7 documents requis** sont présents → `kyc_status` passe à `pending`
- Si le statut est déjà `approved` → reste `approved`

### Documents requis pour KYC complet
1. photo_profil
2. photo_cni_recto
3. photo_cni_verso
4. photo_permis_recto
5. photo_permis_verso
6. photo_carte_grise
7. photo_vehicule

## Exemples

### Avec cURL

```bash
# Upload tous les documents
curl -X POST http://localhost:4000/api/drivers/1/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo_profil=@./profil.jpg" \
  -F "photo_cni_recto=@./cni-recto.jpg" \
  -F "photo_cni_verso=@./cni-verso.jpg" \
  -F "photo_permis_recto=@./permis-recto.jpg" \
  -F "photo_permis_verso=@./permis-verso.jpg" \
  -F "photo_carte_grise=@./carte-grise.jpg" \
  -F "photo_vehicule=@./vehicule.jpg"

# Upload un seul document
curl -X POST http://localhost:4000/api/drivers/1/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo_profil=@./profil.jpg"
```

### Avec JavaScript (React Native)

```typescript
const uploadDocuments = async (driverId: number, files: any) => {
  const formData = new FormData();
  
  if (files.photo_profil) {
    formData.append('photo_profil', {
      uri: files.photo_profil.uri,
      type: 'image/jpeg',
      name: 'profil.jpg',
    } as any);
  }
  
  if (files.photo_cni_recto) {
    formData.append('photo_cni_recto', {
      uri: files.photo_cni_recto.uri,
      type: 'image/jpeg',
      name: 'cni-recto.jpg',
    } as any);
  }
  
  // ... ajouter les autres fichiers
  
  const response = await fetch(`${API_URL}/drivers/${driverId}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  
  return await response.json();
};
```

### Avec Axios

```typescript
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const formData = new FormData();
formData.append('photo_profil', fs.createReadStream('./profil.jpg'));
formData.append('photo_cni_recto', fs.createReadStream('./cni-recto.jpg'));
// ... ajouter les autres fichiers

const response = await axios.post(
  `http://localhost:4000/api/drivers/1/documents/upload`,
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...formData.getHeaders()
    }
  }
);
```

## Erreurs possibles

| Code | Message | Description |
|------|---------|-------------|
| 400 | No valid files uploaded | Aucun fichier valide dans la requête |
| 400 | Type de fichier non supporté | Format non accepté (uniquement JPG, PNG, WebP) |
| 401 | Unauthorized | Token JWT manquant ou invalide |
| 403 | You can only upload your own documents | Le chauffeur essaie d'uploader des docs pour un autre |
| 404 | Driver not found | ID chauffeur inexistant |
| 413 | File too large | Fichier > 5 MB |

## Stockage

### Développement
- Les fichiers sont stockés dans `./uploads/kyc/`
- Format du nom: `driver_{id}_{type}_{timestamp}.{ext}`
- Exemple: `driver_1_photo_profil_1699123456789.jpg`

### Production (recommandé)
Pour la production, il est recommandé d'utiliser un service de stockage cloud:

#### Option 1: AWS S3
```bash
npm install aws-sdk multer-s3
```

#### Option 2: Cloudinary
```bash
npm install cloudinary multer-storage-cloudinary
```

#### Option 3: Google Cloud Storage
```bash
npm install @google-cloud/storage multer-storage-google-cloud
```

## Sécurité

✅ **Vérifications implémentées:**
- Authentication JWT obligatoire
- Vérification des permissions (own or admin)
- Filtrage des types de fichiers
- Limite de taille (5 MB)
- Nettoyage automatique en cas d'erreur

⚠️ **À ajouter en production:**
- Scan antivirus des fichiers uploadés
- Compression/optimisation automatique des images
- CDN pour servir les images
- Backup automatique des documents
- Expiration des URLs signées (pour plus de sécurité)

## Logs

Chaque upload est loggé dans `admin_logs`:
```json
{
  "action": "driver_documents_uploaded",
  "resource_type": "driver",
  "resource_id": 1,
  "details": {
    "uploaded_documents": ["photo_profil", "photo_cni_recto"],
    "total_documents": 2,
    "all_required_present": false
  }
}
```
