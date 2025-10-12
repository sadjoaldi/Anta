/**
 * Geocoding Routes
 * Public routes for address search and geocoding
 */

import { Router } from 'express';
import {
  searchPlaces,
  searchNearby,
  reverseGeocode,
} from '../controllers/geocodingController.js';

const router = Router();

// All routes are public (no authentication required)
router.get('/search', searchPlaces);
router.get('/search-nearby', searchNearby);
router.get('/reverse', reverseGeocode);

export default router;
