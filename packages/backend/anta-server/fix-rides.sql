-- Script pour nettoyer et réinitialiser la migration rides
-- À exécuter avec : mysql -u root -p anta < fix-rides.sql

USE anta;

-- 1. Supprimer la table rides si elle existe
DROP TABLE IF EXISTS rides;

-- 2. Nettoyer knex_migrations
DELETE FROM knex_migrations 
WHERE name = '20251016_000001_create_rides_table.ts';

-- 3. Vérifier le nettoyage
SELECT 'Table rides supprimée et migration nettoyée' AS status;

-- 4. Afficher les migrations restantes
SELECT id, name, batch, migration_time 
FROM knex_migrations 
ORDER BY id DESC 
LIMIT 5;
