-- 🧪 Script de test : Créer des chauffeurs avec positions à Conakry

-- 1. Mettre à jour un chauffeur existant avec position à Conakry
UPDATE drivers 
SET 
  current_latitude = 9.6412,   -- Conakry center
  current_longitude = -13.5784,
  location_updated_at = NOW(),
  status = 'online'
WHERE id = 1;

-- 2. Si tu veux créer plusieurs chauffeurs de test autour de Conakry
-- (À différentes distances du centre)

-- Chauffeur à 1km du centre
UPDATE drivers 
SET 
  current_latitude = 9.6502,   -- ~1km nord
  current_longitude = -13.5784,
  location_updated_at = NOW(),
  status = 'online'
WHERE id = 2;

-- Chauffeur à 2km du centre
UPDATE drivers 
SET 
  current_latitude = 9.6232,   -- ~2km sud
  current_longitude = -13.5784,
  location_updated_at = NOW(),
  status = 'online'
WHERE id = 3;

-- Chauffeur à 3km du centre
UPDATE drivers 
SET 
  current_latitude = 9.6412,
  current_longitude = -13.6054,  -- ~3km ouest
  location_updated_at = NOW(),
  status = 'online'
WHERE id = 4;

-- 3. Vérifier les chauffeurs online avec position
SELECT 
  d.id,
  u.name as driver_name,
  d.status,
  d.current_latitude,
  d.current_longitude,
  d.location_updated_at,
  d.rating_avg,
  d.total_trips,
  d.vehicle_brand,
  d.vehicle_model,
  d.vehicle_color
FROM drivers d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.status = 'online' 
  AND d.current_latitude IS NOT NULL
  AND d.current_longitude IS NOT NULL
ORDER BY d.id;

-- 4. Calculer distance entre centre Conakry et un chauffeur (Haversine)
-- Pour vérifier que la formule fonctionne
SELECT 
  id,
  current_latitude,
  current_longitude,
  (6371000 * acos(
    cos(radians(9.6412)) * cos(radians(current_latitude)) *
    cos(radians(current_longitude) - radians(-13.5784)) +
    sin(radians(9.6412)) * sin(radians(current_latitude))
  )) as distance_meters
FROM drivers
WHERE current_latitude IS NOT NULL
  AND current_longitude IS NOT NULL
  AND status = 'online';
