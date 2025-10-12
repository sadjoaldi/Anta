/**
 * Geocoding Controller
 * Handles address search and geocoding requests
 * Uses Google Places API exclusively
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import geocodingService from '../services/geocoding-google.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Search for places in Guinea
 * @route   GET /api/geocoding/search
 * @access  Public
 */
export const searchPlaces = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = 10 } = req.query;

  if (!q || typeof q !== 'string') {
    throw ApiError.badRequest('Query parameter "q" is required');
  }

  if (q.trim().length < 3) {
    return res.json(ApiResponse.success([]));
  }

  const limitNum = parseInt(limit as string);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
    throw ApiError.badRequest('Limit must be between 1 and 20');
  }

  const results = await geocodingService.searchPlaces(q.trim(), limitNum);

  res.json(ApiResponse.success(results));
});

/**
 * @desc    Search for places near a location
 * @route   GET /api/geocoding/search-nearby
 * @access  Public
 */
export const searchNearby = asyncHandler(async (req: Request, res: Response) => {
  const { q, lat, lng, limit = 10 } = req.query;

  if (!q || typeof q !== 'string') {
    throw ApiError.badRequest('Query parameter "q" is required');
  }

  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw ApiError.badRequest('Invalid coordinates');
  }

  if (q.trim().length < 3) {
    return res.json(ApiResponse.success([]));
  }

  const limitNum = parseInt(limit as string);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
    throw ApiError.badRequest('Limit must be between 1 and 20');
  }

  const results = await geocodingService.searchNearby(
    q.trim(),
    latitude,
    longitude,
    limitNum
  );

  res.json(ApiResponse.success(results));
});

/**
 * @desc    Reverse geocoding - Get address from coordinates
 * @route   GET /api/geocoding/reverse
 * @access  Public
 */
export const reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    throw ApiError.badRequest('Latitude and longitude are required');
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw ApiError.badRequest('Invalid coordinates');
  }

  const address = await geocodingService.reverseGeocode(latitude, longitude);

  if (!address) {
    throw ApiError.notFound('No address found for these coordinates');
  }

  res.json(ApiResponse.success({ address }));
});
