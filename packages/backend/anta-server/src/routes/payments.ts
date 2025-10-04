import { Router } from 'express';
import {
  getPayments,
  getPaymentById,
  getPaymentsByTrip,
  getPaymentsByStatus,
  getTotalRevenue,
  getRevenueByDateRange,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment
} from '../controllers/paymentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Base routes
router.get('/', authenticate, requireAdmin, getPayments); // Admin only - tous les paiements
router.post('/', authenticate, createPayment); // Authenticated - créer un paiement

// Query routes (must be before :id)
router.get('/revenue/total', authenticate, requireAdmin, getTotalRevenue); // Admin only
router.get('/revenue/range', authenticate, requireAdmin, getRevenueByDateRange); // Admin only
router.get('/trip/:tripId', authenticate, getPaymentsByTrip); // Authenticated - vérifiera ownership dans controller
router.get('/status/:status', authenticate, requireAdmin, getPaymentsByStatus); // Admin only

// Individual payment routes
router.get('/:id', authenticate, getPaymentById); // Authenticated - vérifiera ownership dans controller
router.put('/:id', authenticate, requireAdmin, updatePayment); // Admin only
router.delete('/:id', authenticate, requireAdmin, deletePayment); // Admin only

// Action routes
router.patch('/:id/status', authenticate, updatePaymentStatus); // Authenticated - system/gateway update

export default router;
