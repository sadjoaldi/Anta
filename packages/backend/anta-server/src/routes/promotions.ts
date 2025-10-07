import { Router } from 'express';
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  togglePromotionStatus,
  deletePromotion,
  getPromotionStats,
} from '../controllers/promotionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

// Base routes
router.get('/', getPromotions);
router.post('/', createPromotion);

// Individual promotion routes
router.get('/:id', getPromotionById);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

// Action routes
router.patch('/:id/toggle', togglePromotionStatus);
router.get('/:id/stats', getPromotionStats);

export default router;
