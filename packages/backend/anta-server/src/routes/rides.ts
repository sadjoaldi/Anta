/**
 * Rides Routes
 * API endpoints for ride management
 */

import { Router, Request, Response } from 'express';
import ridesService, { CreateRideDto, RideStatus } from '../services/rides.service';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/rides/create
 * Create a new ride request
 * @requires Authentication
 */
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    // Get passenger ID from authenticated user
    const passengerId = req.user!.userId;

    const {
      driverId,
      originLat,
      originLng,
      originAddress,
      destLat,
      destLng,
      destAddress,
      distance,
      duration,
      estimatedPrice,
      vehicleType,
      passengers,
      notes,
    } = req.body;

    // Validate required fields
    if (!driverId || !originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['driverId', 'originLat', 'originLng', 'destLat', 'destLng'],
      });
    }

    const rideData: CreateRideDto = {
      passengerId,
      driverId,
      originLat: parseFloat(originLat),
      originLng: parseFloat(originLng),
      originAddress: originAddress || '',
      destLat: parseFloat(destLat),
      destLng: parseFloat(destLng),
      destAddress: destAddress || '',
      distance: parseInt(distance) || 0,
      duration: parseInt(duration) || 0,
      estimatedPrice: parseInt(estimatedPrice) || 0,
      vehicleType: vehicleType || 'moto',
      passengers: parseInt(passengers) || 1,
      notes: notes || '',
    };

    const ride = await ridesService.createRide(rideData);

    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Create ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create ride',
    });
  }
});

/**
 * GET /api/rides/:rideId
 * Get ride details
 */
router.get('/:rideId', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const ride = await ridesService.getRideById(parseInt(rideId));

    res.json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Get ride error:', error);
    res.status(404).json({
      error: error.message || 'Ride not found',
    });
  }
});

/**
 * PATCH /api/rides/:rideId/status
 * Update ride status
 */
router.patch('/:rideId/status', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { status, finalPrice } = req.body;

    if (!status || !Object.values(RideStatus).includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses: Object.values(RideStatus),
      });
    }

    const additionalData: any = {};
    if (finalPrice) {
      additionalData.final_price = parseInt(finalPrice);
    }

    const ride = await ridesService.updateRideStatus(
      parseInt(rideId),
      status,
      additionalData
    );

    res.json({
      success: true,
      ride,
    });
  } catch (error: any) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update ride status',
    });
  }
});

/**
 * POST /api/rides/:rideId/accept
 * Accept ride (driver)
 */
router.post('/:rideId/accept', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID required' });
    }

    const ride = await ridesService.acceptRide(parseInt(rideId), parseInt(driverId));

    res.json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to accept ride',
    });
  }
});

/**
 * POST /api/rides/:rideId/start
 * Start ride (driver)
 */
router.post('/:rideId/start', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID required' });
    }

    const ride = await ridesService.startRide(parseInt(rideId), parseInt(driverId));

    res.json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Start ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start ride',
    });
  }
});

/**
 * POST /api/rides/:rideId/complete
 * Complete ride (driver)
 */
router.post('/:rideId/complete', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId, finalPrice } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'Driver ID required' });
    }

    const ride = await ridesService.completeRide(
      parseInt(rideId),
      parseInt(driverId),
      finalPrice ? parseInt(finalPrice) : undefined
    );

    res.json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Complete ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete ride',
    });
  }
});

/**
 * POST /api/rides/:rideId/cancel
 * Cancel ride
 */
router.post('/:rideId/cancel', async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ error: 'User ID and type required' });
    }

    if (userType !== 'passenger' && userType !== 'driver') {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const ride = await ridesService.cancelRide(
      parseInt(rideId),
      parseInt(userId),
      userType
    );

    res.json({
      success: true,
      ride,
    });
  } catch (error: any) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cancel ride',
    });
  }
});

/**
 * GET /api/rides/passenger/:passengerId/history
 * Get passenger ride history
 */
router.get('/passenger/:passengerId/history', async (req: Request, res: Response) => {
  try {
    const { passengerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const rides = await ridesService.getPassengerRides(
      parseInt(passengerId),
      limit,
      offset
    );

    res.json({
      success: true,
      data: rides,
      pagination: { limit, offset },
    });
  } catch (error: any) {
    console.error('Get passenger rides error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get passenger rides',
    });
  }
});

/**
 * GET /api/rides/driver/:driverId/pending
 * Get pending ride requests for a driver
 */
router.get('/driver/:driverId/pending', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    const rides = await ridesService.getDriverPendingRides(parseInt(driverId));

    res.json({
      success: true,
      data: rides,
    });
  } catch (error: any) {
    console.error('Get driver pending rides error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get pending rides',
    });
  }
});

/**
 * GET /api/rides/driver/:driverId/history
 * Get driver ride history
 */
router.get('/driver/:driverId/history', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const rides = await ridesService.getDriverRides(
      parseInt(driverId),
      limit,
      offset
    );

    res.json({
      success: true,
      data: rides,
      pagination: { limit, offset },
    });
  } catch (error: any) {
    console.error('Get driver rides error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get driver rides',
    });
  }
});

/**
 * GET /api/rides/passenger/:passengerId/active
 * Get active ride for passenger
 */
router.get('/passenger/:passengerId/active', async (req: Request, res: Response) => {
  try {
    const { passengerId } = req.params;
    const ride = await ridesService.getActivePassengerRide(parseInt(passengerId));

    // Use standard ApiResponse format: { success, data }
    res.json({
      success: true,
      data: ride,
    });
  } catch (error: any) {
    console.error('Get active passenger ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get active ride',
    });
  }
});

/**
 * GET /api/rides/driver/:driverId/active
 * Get active ride for driver
 */
router.get('/driver/:driverId/active', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const ride = await ridesService.getActiveDriverRide(parseInt(driverId));

    // Use standard ApiResponse format: { success, data }
    res.json({
      success: true,
      data: ride,  // ← Changed from "ride" to "data"
    });
  } catch (error: any) {
    console.error('Get active driver ride error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get active ride',
    });
  }
});

export default router;
