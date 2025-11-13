import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Créer le dossier uploads si inexistant
const uploadDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    // Générer un nom unique: driverId_docType_timestamp.ext
    const driverId = req.params.id;
    const docType = file.fieldname;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `driver_${driverId}_${docType}_${timestamp}${ext}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accepter uniquement les images
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Utilisez JPG, PNG ou WebP.`));
  }
};

// Configuration Multer
export const uploadKycDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max par fichier
  }
}).fields([
  { name: 'photo_profil', maxCount: 1 },
  { name: 'photo_cni_recto', maxCount: 1 },
  { name: 'photo_cni_verso', maxCount: 1 },
  { name: 'photo_permis_recto', maxCount: 1 },
  { name: 'photo_permis_verso', maxCount: 1 },
  { name: 'photo_carte_grise', maxCount: 1 },
  { name: 'photo_vehicule', maxCount: 1 },
]);

// Middleware pour nettoyer les anciens fichiers en cas d'erreur
export const cleanupUploadedFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${file.path}:`, error);
    }
  });
};
