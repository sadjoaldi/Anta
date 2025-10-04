import { Router } from 'express';
import {
  getVehicles,
  getVehicleById,
  getVehicleByDriverId,
  getVehiclesByType,
  getActiveVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticate, requireAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// Base routes
router.get('/', authenticate, getVehicles); // Tous les utilisateurs authentifiés
router.post('/', authenticate, requireRole('driver', 'admin'), createVehicle); // Driver + Admin

// Query routes (must be before :id)
router.get('/active', authenticate, getActiveVehicles); // Tous les utilisateurs authentifiés
router.get('/type/:type', authenticate, getVehiclesByType); // Tous les utilisateurs authentifiés
router.get('/driver/:driverId', authenticate, getVehicleByDriverId); // Tous les utilisateurs authentifiés

// Individual vehicle routes
router.get('/:id', authenticate, getVehicleById); // Tous les utilisateurs authentifiés
router.put('/:id', authenticate, requireRole('driver', 'admin'), updateVehicle); // Driver (own) + Admin
router.delete('/:id', authenticate, requireRole('driver', 'admin'), deleteVehicle); // Driver (own) + Admin

// Action routes
router.patch('/:id/status', authenticate, requireRole('driver', 'admin'), updateVehicleStatus); // Driver (own) + Admin

export default router;
