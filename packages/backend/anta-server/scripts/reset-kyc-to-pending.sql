-- Script pour réinitialiser le KYC d'un driver approuvé par erreur
-- Utilisez ce script si vous avez approuvé par erreur un driver

-- 1. Voir le statut actuel d'Aliou (driver_id = 4)
SELECT 
  id,
  user_id,
  kyc_status,
  kyc_approved_at,
  kyc_approved_by,
  kyc_rejection_reason,
  kyc_rejected_at
FROM drivers 
WHERE id = 4;

-- 2. Réinitialiser le KYC à "pending" pour permettre un nouveau cycle d'examen
UPDATE drivers 
SET 
  kyc_status = 'pending',
  kyc_approved_at = NULL,
  kyc_approved_by = NULL,
  kyc_rejection_reason = NULL,
  kyc_rejected_at = NULL
WHERE id = 4;

-- 3. Vérifier que la mise à jour a réussi
SELECT 
  id,
  user_id,
  kyc_status,
  kyc_approved_at,
  kyc_approved_by,
  kyc_rejection_reason,
  kyc_rejected_at
FROM drivers 
WHERE id = 4;

-- Résultat attendu après l'update:
-- | id | user_id | kyc_status | kyc_approved_at | kyc_approved_by | kyc_rejection_reason | kyc_rejected_at |
-- |----|---------|------------|-----------------|-----------------|----------------------|-----------------|
-- | 4  | 12      | pending    | NULL            | NULL            | NULL                 | NULL            |

-- 4. OPTIONNEL: Si vous voulez aussi remettre le role de l'utilisateur à 'driver' (au lieu d'un driver approuvé)
-- UPDATE users SET role = 'driver' WHERE id = 12;

-- 5. OPTIONNEL: Si vous voulez effacer tous les documents pour recommencer à zéro
-- UPDATE drivers SET kyc_documents = NULL WHERE id = 4;
