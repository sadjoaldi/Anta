/**
 * Directions Routes
 * Public routes for route calculation and pricing
 */

import { Router } from 'express';
import { getRoute, getPricing } from '../controllers/directionsController.js';

const router = Router();

// All routes are public (no authentication required)
router.get('/route', getRoute);
router.get('/pricing', getPricing);

export default router;
