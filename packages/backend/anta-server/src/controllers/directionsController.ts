/**
 * Directions Controller
 * Handles route calculation and price estimation
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import directionsService from '../services/directions.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Calculate route between two points
 * @route   GET /api/directions/route
 * @access  Public
 */
export const getRoute = asyncHandler(async (req: Request, res: Response) => {
  const { originLat, originLng, destLat, destLng } = req.query;

  // Validate parameters
  if (!originLat || !originLng || !destLat || !destLng) {
    throw ApiError.badRequest(
      'Origin and destination coordinates are required (originLat, originLng, destLat, destLng)'
    );
  }

  const origin = {
    lat: parseFloat(originLat as string),
    lng: parseFloat(originLng as string),
  };

  const destination = {
    lat: parseFloat(destLat as string),
    lng: parseFloat(destLng as string),
  };

  // Validate coordinates
  if (
    isNaN(origin.lat) ||
    isNaN(origin.lng) ||
    isNaN(destination.lat) ||
    isNaN(destination.lng)
  ) {
    throw ApiError.badRequest('Invalid coordinates');
  }

  // Validate coordinate ranges
  if (
    origin.lat < -90 ||
    origin.lat > 90 ||
    destination.lat < -90 ||
    destination.lat > 90 ||
    origin.lng < -180 ||
    origin.lng > 180 ||
    destination.lng < -180 ||
    destination.lng > 180
  ) {
    throw ApiError.badRequest('Coordinates out of valid range');
  }

  const routeInfo = await directionsService.getRoute(origin, destination);

  res.json(ApiResponse.success(routeInfo));
});

/**
 * @desc    Get current pricing configuration
 * @route   GET /api/directions/pricing
 * @access  Public
 */
export const getPricing = asyncHandler(async (req: Request, res: Response) => {
  const pricing = directionsService.getPricing();
  res.json(ApiResponse.success(pricing));
});
