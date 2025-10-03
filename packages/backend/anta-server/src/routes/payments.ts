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

const router = Router();

// Base routes
router.get('/', getPayments);
router.post('/', createPayment);

// Query routes (must be before :id)
router.get('/revenue/total', getTotalRevenue);
router.get('/revenue/range', getRevenueByDateRange);
router.get('/trip/:tripId', getPaymentsByTrip);
router.get('/status/:status', getPaymentsByStatus);

// Individual payment routes
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

// Action routes
router.patch('/:id/status', updatePaymentStatus);

export default router;
