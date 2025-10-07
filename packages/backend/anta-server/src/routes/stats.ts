import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Dashboard statistics (admin only)
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

export default router;
