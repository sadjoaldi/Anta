import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Trip from '../models/Trip.js';
import { TripStatus } from '../models/types.js';

/**
 * @desc    Get all trips
 * @route   GET /api/trips
 * @access  Private/Admin
 */
export const getTrips = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.findAll(undefined, limit, offset);
  const total = await Trip.count();

  res.json(ApiResponse.paginated(trips, page, limit, total));
});

/**
 * @desc    Get trip by ID
 * @route   GET /api/trips/:id
 * @access  Private
 */
export const getTripById = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  res.json(ApiResponse.success(trip));
});

/**
 * @desc    Get trip with full details
 * @route   GET /api/trips/:id/details
 * @access  Private
 */
export const getTripWithDetails = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  
  const trip = await Trip.getTripWithDetails(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  res.json(ApiResponse.success(trip));
});

/**
 * @desc    Get trips by passenger
 * @route   GET /api/trips/passenger/:passengerId
 * @access  Private
 */
export const getTripsByPassenger = asyncHandler(async (req: Request, res: Response) => {
  const passengerId = parseInt(req.params.passengerId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.getByPassenger(passengerId, limit, offset);
  const total = await Trip.count({ passenger_id: passengerId });

  res.json(ApiResponse.paginated(trips, page, limit, total));
});

/**
 * @desc    Get trips by driver
 * @route   GET /api/trips/driver/:driverId
 * @access  Private
 */
export const getTripsByDriver = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.driverId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.getByDriver(driverId, limit, offset);
  const total = await Trip.count({ driver_id: driverId });

  res.json(ApiResponse.paginated(trips, page, limit, total));
});

/**
 * @desc    Get trips by status
 * @route   GET /api/trips/status/:status
 * @access  Private
 */
export const getTripsByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.params.status as TripStatus;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.getByStatus(status, limit, offset);
  const total = await Trip.count({ status });

  res.json(ApiResponse.paginated(trips, page, limit, total));
});

/**
 * @desc    Get pending trips
 * @route   GET /api/trips/pending
 * @access  Private
 */
export const getPendingTrips = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.getPendingTrips(limit, offset);
  const total = await Trip.count({ status: 'pending' });

  res.json(ApiResponse.paginated(trips, page, limit, total));
});

/**
 * @desc    Get active trips
 * @route   GET /api/trips/active
 * @access  Private
 */
export const getActiveTrips = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const trips = await Trip.getActiveTrips(limit, offset);
  
  res.json(ApiResponse.success(trips));
});

/**
 * @desc    Get driver's current active trip
 * @route   GET /api/trips/driver/:driverId/active
 * @access  Private
 */
export const getDriverActiveTrip = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.driverId);
  
  const trip = await Trip.getDriverActiveTrip(driverId);
  
  res.json(ApiResponse.success(trip || null));
});

/**
 * @desc    Get passenger's current active trip
 * @route   GET /api/trips/passenger/:passengerId/active
 * @access  Private
 */
export const getPassengerActiveTrip = asyncHandler(async (req: Request, res: Response) => {
  const passengerId = parseInt(req.params.passengerId);
  
  const trip = await Trip.getPassengerActiveTrip(passengerId);
  
  res.json(ApiResponse.success(trip || null));
});

/**
 * @desc    Get trip history for user
 * @route   GET /api/trips/user/:userId/history
 * @access  Private
 */
export const getUserTripHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const trips = await Trip.getTripHistory(userId, limit, offset);
  
  res.json(ApiResponse.success(trips));
});

/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private
 */
export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const {
    passenger_id,
    origin_lat,
    origin_lng,
    origin_text,
    dest_lat,
    dest_lng,
    dest_text,
    price_estimated,
    distance_m,
    duration_s,
    payment_method
  } = req.body;

  const tripId = await Trip.create({
    passenger_id,
    origin_lat,
    origin_lng,
    origin_text,
    dest_lat,
    dest_lng,
    dest_text,
    status: 'pending',
    price_estimated,
    distance_m,
    duration_s,
    payment_method,
    payment_status: 'pending'
  });

  const trip = await Trip.findById(tripId);
  res.status(201).json(ApiResponse.success(trip));
});

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private
 */
export const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  await Trip.updateById(tripId, req.body);
  const updatedTrip = await Trip.findById(tripId);

  res.json(ApiResponse.success(updatedTrip));
});

/**
 * @desc    Update trip status
 * @route   PATCH /api/trips/:id/status
 * @access  Private
 */
export const updateTripStatus = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  const { status } = req.body as { status: TripStatus };

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  await Trip.updateStatus(tripId, status);
  const updatedTrip = await Trip.findById(tripId);

  res.json(ApiResponse.success(updatedTrip));
});

/**
 * @desc    Assign driver to trip
 * @route   POST /api/trips/:id/assign
 * @access  Private
 */
export const assignDriverToTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  const { driver_id, vehicle_id } = req.body;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  if (trip.status !== 'pending') {
    throw ApiError.badRequest('Trip is not in pending status');
  }

  await Trip.assignDriver(tripId, driver_id, vehicle_id);
  const updatedTrip = await Trip.findById(tripId);

  res.json(ApiResponse.success(updatedTrip));
});

/**
 * @desc    Complete trip
 * @route   POST /api/trips/:id/complete
 * @access  Private
 */
export const completeTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  const { price_final } = req.body;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  await Trip.completeTrip(tripId, price_final);
  const updatedTrip = await Trip.findById(tripId);

  res.json(ApiResponse.success(updatedTrip));
});

/**
 * @desc    Cancel trip
 * @route   POST /api/trips/:id/cancel
 * @access  Private
 */
export const cancelTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);
  const { reason } = req.body;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  await Trip.cancelTrip(tripId, reason);
  const updatedTrip = await Trip.findById(tripId);

  res.json(ApiResponse.success(updatedTrip));
});

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private/Admin
 */
export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.id);

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw ApiError.notFound('Trip');
  }

  await Trip.deleteById(tripId);
  res.json(ApiResponse.success({ message: 'Trip deleted successfully' }));
});
