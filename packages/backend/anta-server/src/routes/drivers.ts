import { Router } from 'express';
import {
  getDrivers,
  getDriverById,
  getDriverByUserId,
  getDriversByStatus,
  getOnlineDrivers,
  getAvailableDrivers,
  getDriversWithDetails,
  createDriver,
  updateDriver,
  updateDriverStatus,
  updateDriverRating,
  incrementDriverTrips,
  deleteDriver
} from '../controllers/driverController.js';

const router = Router();

// Base routes
router.get('/', getDrivers);
router.post('/', createDriver);

// Query routes (must be before :id)
router.get('/online', getOnlineDrivers);
router.get('/available', getAvailableDrivers);
router.get('/details', getDriversWithDetails);
router.get('/status/:status', getDriversByStatus);
router.get('/user/:userId', getDriverByUserId);

// Individual driver routes
router.get('/:id', getDriverById);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

// Action routes
router.patch('/:id/status', updateDriverStatus);
router.patch('/:id/rating', updateDriverRating);
router.post('/:id/increment-trips', incrementDriverTrips);

export default router;
