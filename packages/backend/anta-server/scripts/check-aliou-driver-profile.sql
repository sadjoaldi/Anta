-- Vérifier le profil driver d'Aliou (user_id = 12)

-- 1. Voir le profil complet d'Aliou avec son driver
SELECT 
  u.id as user_id,
  u.name,
  u.phone,
  u.role,
  d.id as driver_id,
  d.kyc_status,
  d.status as driver_status,
  d.kyc_documents,
  d.kyc_approved_at,
  d.kyc_rejected_at,
  d.kyc_rejection_reason
FROM users u
LEFT JOIN drivers d ON u.id = d.user_id
WHERE u.id = 12;

-- Si driver_id est NULL → Aliou n'a pas de profil driver
-- Si driver_id existe → On peut réinitialiser son KYC

-- 2a. Si driver_id est NULL, on ne fait rien (l'app créera le profil)
-- Pas d'action nécessaire

-- 2b. Si driver_id existe, réinitialiser son KYC pour le test:
UPDATE drivers 
SET 
  kyc_status = 'pending',
  kyc_documents = NULL,
  kyc_rejection_reason = NULL,
  kyc_approved_at = NULL,
  kyc_rejected_at = NULL,
  kyc_approved_by = NULL
WHERE user_id = 12;

-- 3. Vérifier après la mise à jour
SELECT 
  u.id as user_id,
  u.name,
  d.id as driver_id,
  d.kyc_status,
  d.kyc_documents
FROM users u
LEFT JOIN drivers d ON u.id = d.user_id
WHERE u.id = 12;
