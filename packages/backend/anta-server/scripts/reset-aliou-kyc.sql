-- Script pour réinitialiser le KYC d'Aliou (ou n'importe quel chauffeur)
-- Cela permet de tester le workflow complet

-- 1. Trouver Aliou
SELECT u.id, u.name, u.phone, d.id as driver_id, d.kyc_status, d.kyc_documents
FROM users u
INNER JOIN drivers d ON u.id = d.user_id
WHERE u.name LIKE '%Aliou%'
LIMIT 1;

-- 2. Réinitialiser son KYC (remplacer {driver_id} par l'ID réel)
UPDATE drivers 
SET 
  kyc_status = 'pending',
  kyc_documents = NULL,
  kyc_rejection_reason = NULL,
  kyc_approved_at = NULL,
  kyc_rejected_at = NULL,
  kyc_approved_by = NULL
WHERE id = {driver_id};

-- 3. Vérifier
SELECT * FROM drivers WHERE id = {driver_id};

-- 4. Optionnel: Mettre en rejected avec une raison
-- UPDATE drivers 
-- SET 
--   kyc_status = 'rejected',
--   kyc_documents = NULL,
--   kyc_rejection_reason = 'Documents de test - veuillez soumettre de vrais documents',
--   kyc_rejected_at = NOW()
-- WHERE id = {driver_id};

-- 5. Pour voir tous les chauffeurs et leur statut KYC
SELECT 
  u.name,
  u.phone,
  d.kyc_status,
  d.kyc_documents IS NOT NULL as has_documents,
  d.kyc_approved_at,
  d.kyc_rejected_at,
  d.kyc_rejection_reason
FROM users u
INNER JOIN drivers d ON u.id = d.user_id
ORDER BY d.kyc_status, u.name;
