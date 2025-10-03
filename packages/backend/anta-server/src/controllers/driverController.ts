import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Driver from '../models/Driver.js';
import { DriverStatus } from '../models/types.js';

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private/Admin
 */
export const getDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.findAll(undefined, limit, offset);
  const total = await Driver.count();

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private
 */
export const getDriverById = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  res.json(ApiResponse.success(driver));
});

/**
 * @desc    Get driver by user ID
 * @route   GET /api/drivers/user/:userId
 * @access  Private
 */
export const getDriverByUserId = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  
  const driver = await Driver.findByUserId(userId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  res.json(ApiResponse.success(driver));
});

/**
 * @desc    Get drivers by status
 * @route   GET /api/drivers/status/:status
 * @access  Private
 */
export const getDriversByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.params.status as DriverStatus;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getByStatus(status, limit, offset);
  const total = await Driver.count({ status });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get online drivers
 * @route   GET /api/drivers/online
 * @access  Private
 */
export const getOnlineDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getOnlineDrivers(limit, offset);
  const total = await Driver.count({ status: 'online' });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get available drivers
 * @route   GET /api/drivers/available
 * @access  Private
 */
export const getAvailableDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getAvailableDrivers(limit, offset);
  const total = await Driver.count({ status: 'online' });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get drivers with full details
 * @route   GET /api/drivers/details
 * @access  Private/Admin
 */
export const getDriversWithDetails = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getDriversWithDetails(limit, offset);
  // Note: getDriversWithDetails returns a complex join, count might need adjustment
  const total = await Driver.count();

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Create new driver
 * @route   POST /api/drivers
 * @access  Private/Admin
 */
export const createDriver = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, vehicle_id, status, kyc_status } = req.body;

  // Check if user is already a driver
  const existingDriver = await Driver.findByUserId(user_id);
  if (existingDriver) {
    throw ApiError.conflict('User is already registered as a driver');
  }

  const driverId = await Driver.create({
    user_id,
    vehicle_id,
    status: status || 'offline',
    kyc_status: kyc_status || 'pending',
    rating_avg: 5.0,
    total_trips: 0
  });

  const driver = await Driver.findById(driverId);
  res.status(201).json(ApiResponse.success(driver));
});

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private
 */
export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { vehicle_id, status, kyc_status, rating_avg, total_trips } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateById(driverId, {
    vehicle_id,
    status,
    kyc_status,
    rating_avg,
    total_trips
  });

  const updatedDriver = await Driver.findById(driverId);
  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Update driver status
 * @route   PATCH /api/drivers/:id/status
 * @access  Private
 */
export const updateDriverStatus = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { status } = req.body as { status: DriverStatus };

  if (!['offline', 'online', 'busy', 'suspended'].includes(status)) {
    throw ApiError.badRequest('Invalid status value');
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateStatus(driverId, status);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Update driver rating
 * @route   PATCH /api/drivers/:id/rating
 * @access  Private
 */
export const updateDriverRating = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { rating_avg, total_trips } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateRating(driverId, rating_avg, total_trips);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Increment driver trips
 * @route   POST /api/drivers/:id/increment-trips
 * @access  Private
 */
export const incrementDriverTrips = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.incrementTrips(driverId);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  Private/Admin
 */
export const deleteDriver = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.deleteById(driverId);
  res.json(ApiResponse.success({ message: 'Driver deleted successfully' }));
});
