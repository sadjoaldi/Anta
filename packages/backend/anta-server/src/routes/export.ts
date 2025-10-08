import { Router } from 'express';
import {
  exportUsers,
  exportDrivers,
  exportTrips,
  exportPayments,
  exportPromotions,
} from '../controllers/exportController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All export routes require admin access
router.use(authenticate, requireAdmin);

router.get('/users', exportUsers);
router.get('/drivers', exportDrivers);
router.get('/trips', exportTrips);
router.get('/payments', exportPayments);
router.get('/promotions', exportPromotions);

export default router;
