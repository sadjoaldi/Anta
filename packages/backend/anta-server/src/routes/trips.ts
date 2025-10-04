import { Router } from 'express';
import {
  getTrips,
  getTripById,
  getTripWithDetails,
  getTripsByPassenger,
  getTripsByDriver,
  getTripsByStatus,
  getPendingTrips,
  getActiveTrips,
  getDriverActiveTrip,
  getPassengerActiveTrip,
  getUserTripHistory,
  createTrip,
  updateTrip,
  updateTripStatus,
  assignDriverToTrip,
  completeTrip,
  cancelTrip,
  deleteTrip
} from '../controllers/tripController.js';
import { authenticate, requireAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// Base routes
router.get('/', authenticate, requireAdmin, getTrips); // Admin only - toutes les courses
router.post('/', authenticate, createTrip); // Authenticated users peuvent créer une course

// Query routes (must be before :id)
router.get('/pending', authenticate, requireRole('driver', 'admin'), getPendingTrips); // Drivers + Admin
router.get('/active', authenticate, requireRole('driver', 'admin'), getActiveTrips); // Drivers + Admin
router.get('/status/:status', authenticate, requireAdmin, getTripsByStatus); // Admin only
router.get('/passenger/:passengerId', authenticate, getTripsByPassenger); // Passenger (own) + Admin
router.get('/driver/:driverId', authenticate, requireRole('driver', 'admin'), getTripsByDriver); // Driver (own) + Admin
router.get('/driver/:driverId/active', authenticate, requireRole('driver', 'admin'), getDriverActiveTrip); // Driver (own) + Admin
router.get('/passenger/:passengerId/active', authenticate, getPassengerActiveTrip); // Passenger (own) + Admin
router.get('/user/:userId/history', authenticate, getUserTripHistory); // User (own) + Admin

// Individual trip routes
router.get('/:id', authenticate, getTripById); // Authenticated - vérifiera ownership dans controller
router.get('/:id/details', authenticate, getTripWithDetails); // Authenticated - vérifiera ownership dans controller
router.put('/:id', authenticate, updateTrip); // Authenticated - vérifiera ownership dans controller
router.delete('/:id', authenticate, requireAdmin, deleteTrip); // Admin only

// Action routes
router.patch('/:id/status', authenticate, requireRole('driver', 'admin'), updateTripStatus); // Driver + Admin
router.post('/:id/assign', authenticate, requireRole('driver', 'admin'), assignDriverToTrip); // Driver + Admin
router.post('/:id/complete', authenticate, requireRole('driver', 'admin'), completeTrip); // Driver + Admin
router.post('/:id/cancel', authenticate, cancelTrip); // Passenger/Driver (own trip) + Admin

export default router;
