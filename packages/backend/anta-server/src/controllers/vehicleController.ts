import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Vehicle from '../models/Vehicle.js';
import { VehicleType, VehicleStatus } from '../models/types.js';

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Private/Admin
 */
export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const vehicles = await Vehicle.findAll(undefined, limit, offset);
  const total = await Vehicle.count();

  res.json(ApiResponse.paginated(vehicles, page, limit, total));
});

/**
 * @desc    Get vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id);
  
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle');
  }

  res.json(ApiResponse.success(vehicle));
});

/**
 * @desc    Get vehicle by driver ID
 * @route   GET /api/vehicles/driver/:driverId
 * @access  Private
 */
export const getVehicleByDriverId = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.driverId);
  
  const vehicle = await Vehicle.findByDriverId(driverId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle');
  }

  res.json(ApiResponse.success(vehicle));
});

/**
 * @desc    Get vehicles by type
 * @route   GET /api/vehicles/type/:type
 * @access  Private
 */
export const getVehiclesByType = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as VehicleType;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const vehicles = await Vehicle.getByType(type, limit, offset);
  const total = await Vehicle.count({ type });

  res.json(ApiResponse.paginated(vehicles, page, limit, total));
});

/**
 * @desc    Get active vehicles
 * @route   GET /api/vehicles/active
 * @access  Private
 */
export const getActiveVehicles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const vehicles = await Vehicle.getActiveVehicles(limit, offset);
  const total = await Vehicle.count({ status: 'active' });

  res.json(ApiResponse.paginated(vehicles, page, limit, total));
});

/**
 * @desc    Create new vehicle
 * @route   POST /api/vehicles
 * @access  Private
 */
export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const { driver_id, type, model, color, capacity, status } = req.body;

  const vehicleId = await Vehicle.create({
    driver_id,
    type,
    model,
    color,
    capacity,
    status: status || 'pending'
  });

  const vehicle = await Vehicle.findById(vehicleId);
  res.status(201).json(ApiResponse.success(vehicle));
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private
 */
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id);
  const { driver_id, type, model, color, capacity, status } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle');
  }

  await Vehicle.updateById(vehicleId, {
    driver_id,
    type,
    model,
    color,
    capacity,
    status,
    updated_at: new Date()
  });

  const updatedVehicle = await Vehicle.findById(vehicleId);
  res.json(ApiResponse.success(updatedVehicle));
});

/**
 * @desc    Update vehicle status
 * @route   PATCH /api/vehicles/:id/status
 * @access  Private
 */
export const updateVehicleStatus = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id);
  const { status } = req.body as { status: VehicleStatus };

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle');
  }

  await Vehicle.updateStatus(vehicleId, status);
  const updatedVehicle = await Vehicle.findById(vehicleId);

  res.json(ApiResponse.success(updatedVehicle));
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private/Admin
 */
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.id);

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle');
  }

  await Vehicle.deleteById(vehicleId);
  res.json(ApiResponse.success({ message: 'Vehicle deleted successfully' }));
});
