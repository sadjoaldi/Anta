-- Script pour préparer Aliou pour le test du workflow KYC complet
-- Ce script va:
-- 1. S'assurer qu'Aliou existe avec le role 'driver'
-- 2. Supprimer son profil driver existant (si présent)
-- 3. Permettre à l'app de créer un nouveau profil vierge lors de l'upload

-- 1. Trouver Aliou
SELECT id, name, phone, role 
FROM users 
WHERE name LIKE '%Aliou%' OR phone LIKE '%Aliou%'
LIMIT 5;

-- 2. Mettre son role à 'driver' (remplacer {user_id} par l'ID réel d'Aliou)
-- UPDATE users 
-- SET role = 'driver'
-- WHERE id = {user_id};

-- 3. Supprimer son profil driver existant (pour forcer la création d'un nouveau)
-- DELETE FROM drivers 
-- WHERE user_id = {user_id};

-- 4. Vérifier qu'il n'a plus de profil driver
-- SELECT u.id, u.name, u.role, d.id as driver_id
-- FROM users u
-- LEFT JOIN drivers d ON u.id = d.user_id
-- WHERE u.id = {user_id};

-- Le résultat attendu: driver_id doit être NULL

-- ===== EXEMPLE COMPLET =====
-- Si Aliou a l'ID 5:

-- Mettre son role à driver
-- UPDATE users SET role = 'driver' WHERE id = 5;

-- Supprimer son profil driver
-- DELETE FROM drivers WHERE user_id = 5;

-- Vérifier
-- SELECT u.id, u.name, u.role, d.id as driver_id
-- FROM users u
-- LEFT JOIN drivers d ON u.id = d.user_id
-- WHERE u.id = 5;

-- Résultat attendu:
-- | id | name  | role   | driver_id |
-- |----|-------|--------|-----------|
-- | 5  | Aliou | driver | NULL      |
