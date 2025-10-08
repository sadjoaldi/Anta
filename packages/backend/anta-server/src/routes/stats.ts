import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getPaymentMethodsChart,
  getUserRegistrationsChart,
  getTripCompletionChart,
} from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Chart data endpoints
router.get('/revenue-chart', getRevenueChart);
router.get('/payment-methods', getPaymentMethodsChart);
router.get('/user-registrations', getUserRegistrationsChart);
router.get('/trip-completion', getTripCompletionChart);

export default router;
