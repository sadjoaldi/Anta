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

const router = Router();

// Base routes
router.get('/', getTrips);
router.post('/', createTrip);

// Query routes (must be before :id)
router.get('/pending', getPendingTrips);
router.get('/active', getActiveTrips);
router.get('/status/:status', getTripsByStatus);
router.get('/passenger/:passengerId', getTripsByPassenger);
router.get('/driver/:driverId', getTripsByDriver);
router.get('/driver/:driverId/active', getDriverActiveTrip);
router.get('/passenger/:passengerId/active', getPassengerActiveTrip);
router.get('/user/:userId/history', getUserTripHistory);

// Individual trip routes
router.get('/:id', getTripById);
router.get('/:id/details', getTripWithDetails);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Action routes
router.patch('/:id/status', updateTripStatus);
router.post('/:id/assign', assignDriverToTrip);
router.post('/:id/complete', completeTrip);
router.post('/:id/cancel', cancelTrip);

export default router;
