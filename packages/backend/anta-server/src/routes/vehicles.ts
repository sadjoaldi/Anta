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

const router = Router();

// Base routes
router.get('/', getVehicles);
router.post('/', createVehicle);

// Query routes (must be before :id)
router.get('/active', getActiveVehicles);
router.get('/type/:type', getVehiclesByType);
router.get('/driver/:driverId', getVehicleByDriverId);

// Individual vehicle routes
router.get('/:id', getVehicleById);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Action routes
router.patch('/:id/status', updateVehicleStatus);

export default router;
