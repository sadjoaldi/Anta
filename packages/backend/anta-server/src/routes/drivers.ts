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
import { authenticate, requireAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// Base routes
router.get('/', authenticate, getDrivers); // Tous les utilisateurs authentifiés
router.post('/', authenticate, requireAdmin, createDriver); // Admin only (ou via register)

// Query routes (must be before :id)
router.get('/online', authenticate, getOnlineDrivers); // Public pour voir les drivers disponibles
router.get('/available', authenticate, getAvailableDrivers); // Public pour voir les drivers disponibles
router.get('/details', authenticate, requireAdmin, getDriversWithDetails); // Admin only
router.get('/status/:status', authenticate, requireAdmin, getDriversByStatus); // Admin only
router.get('/user/:userId', authenticate, getDriverByUserId); // Authenticated users

// Individual driver routes
router.get('/:id', authenticate, getDriverById); // Tous les utilisateurs authentifiés
router.put('/:id', authenticate, requireRole('driver', 'admin'), updateDriver); // Driver (own) or Admin
router.delete('/:id', authenticate, requireAdmin, deleteDriver); // Admin only

// Action routes
router.patch('/:id/status', authenticate, requireRole('driver', 'admin'), updateDriverStatus); // Driver (own) or Admin
router.patch('/:id/rating', authenticate, updateDriverRating); // System or Admin (après une course)
router.post('/:id/increment-trips', authenticate, incrementDriverTrips); // System (après une course)

export default router;
