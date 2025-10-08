import { Router } from 'express';
import {
  getAdminLogs,
  getAdminLogById,
  getAdminLogStats,
} from '../controllers/adminLogController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require admin access
router.use(authenticate, requireAdmin);

router.get('/', getAdminLogs);
router.get('/stats', getAdminLogStats);
router.get('/:id', getAdminLogById);

export default router;
