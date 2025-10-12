import { Router } from 'express';
import {
  getDrivers,
  getDriverById,
  getDriverByUserId,
  getDriversByStatus,
  getOnlineDrivers,
  getAvailableDrivers,
  getDriversWithDetails,
  createDriver,
  updateDriver,
  updateDriverStatus,
  updateDriverRating,
  incrementDriverTrips,
  deleteDriver,
  getPendingKycDrivers,
  getDriversByKycStatus,
  approveDriverKyc,
  rejectDriverKyc
} from '../controllers/driverController.js';
import { authenticate, requireAdmin, requireRole } from '../middleware/auth.js';

const router = Router();

// Base routes
router.get('/', authenticate, getDrivers); // Tous les utilisateurs authentifiés
router.post('/', authenticate, createDriver); // Authenticated users (can create own profile) / Admin (can create for any user)

// Query routes (must be before :id)
router.get('/online', authenticate, getOnlineDrivers); // Authenticated users
router.get('/available', getAvailableDrivers); // Public - for mobile app to see nearby drivers
router.get('/details', authenticate, requireAdmin, getDriversWithDetails); // Admin only
router.get('/status/:status', authenticate, requireAdmin, getDriversByStatus); // Admin only
router.get('/user/:userId', authenticate, getDriverByUserId); // Authenticated users

// KYC routes (Admin only)
router.get('/kyc/pending', authenticate, requireAdmin, getPendingKycDrivers); // Get pending KYC requests
router.get('/kyc/:status', authenticate, requireAdmin, getDriversByKycStatus); // Get drivers by KYC status

// Individual driver routes
router.get('/:id', authenticate, getDriverById); // Tous les utilisateurs authentifiés
router.put('/:id', authenticate, requireRole('driver', 'admin'), updateDriver); // Driver (own) or Admin
router.delete('/:id', authenticate, requireAdmin, deleteDriver); // Admin only

// Action routes
router.patch('/:id/status', authenticate, requireRole('driver', 'admin'), updateDriverStatus); // Driver (own) or Admin
router.patch('/:id/rating', authenticate, updateDriverRating); // System or Admin (après une course)
router.post('/:id/increment-trips', authenticate, incrementDriverTrips); // System (après une course)

// KYC action routes (Admin only)
router.patch('/:id/kyc/approve', authenticate, requireAdmin, approveDriverKyc); // Approve driver KYC
router.patch('/:id/kyc/reject', authenticate, requireAdmin, rejectDriverKyc); // Reject driver KYC

export default router;
