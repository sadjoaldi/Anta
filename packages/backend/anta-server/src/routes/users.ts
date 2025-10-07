import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getUserByPhone,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getActiveUsers,
  suspendUser,
  activateUser
} from '../controllers/userController.js';
import { authenticate, requireAdmin, requireOwnership } from '../middleware/auth.js';
import { createLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Base routes (admin only)
router.get('/', authenticate, requireAdmin, getUsers);

// User creation (public but rate limited) - use /auth/register instead
router.post('/', createLimiter, createUser);

// Active users (admin only)
router.get('/active', authenticate, requireAdmin, getActiveUsers);

// Query by phone/email (admin only)
router.get('/phone/:phone', authenticate, requireAdmin, getUserByPhone);
router.get('/email/:email', authenticate, requireAdmin, getUserByEmail);

// Individual user routes
router.get('/:id', authenticate, getUserById); // Can view own profile or admin can view all
router.put('/:id', authenticate, requireOwnership(), updateUser); // Can only update own profile (or admin)
router.delete('/:id', authenticate, requireAdmin, deleteUser); // Admin only

// User moderation (admin only)
router.patch('/:id/suspend', authenticate, requireAdmin, suspendUser);
router.patch('/:id/activate', authenticate, requireAdmin, activateUser);

export default router;
