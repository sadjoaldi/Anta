import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logAdminAction } from '../utils/adminLogger.js';
import { cleanupUploadedFiles } from '../middleware/upload.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { DriverStatus } from '../models/types.js';
import path from 'path';

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private/Admin
 */
export const getDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.findAll(undefined, limit, offset);
  const total = await Driver.count();

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private
 */
export const getDriverById = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  res.json(ApiResponse.success(driver));
});

/**
 * @desc    Get driver by user ID
 * @route   GET /api/drivers/user/:userId
 * @access  Private
 */
export const getDriverByUserId = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  
  const driver = await Driver.findByUserId(userId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  res.json(ApiResponse.success(driver));
});

/**
 * @desc    Get drivers by status
 * @route   GET /api/drivers/status/:status
 * @access  Private
 */
export const getDriversByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.params.status as DriverStatus;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getByStatus(status, limit, offset);
  const total = await Driver.count({ status });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get online drivers
 * @route   GET /api/drivers/online
 * @access  Private
 */
export const getOnlineDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getOnlineDrivers(limit, offset);
  const total = await Driver.count({ status: 'online' });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get available drivers (with optional location filter)
 * @route   GET /api/drivers/available
 * @access  Public (for mobile app to see nearby drivers)
 */
export const getAvailableDrivers = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius = 5000 } = req.query;

  // If location provided, search nearby drivers
  if (lat && lng) {
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = parseInt(radius as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw ApiError.badRequest('Invalid coordinates');
    }

    const drivers = await Driver.getAvailableNearby(latitude, longitude, searchRadius);

    return res.json(ApiResponse.success({
      drivers,
      count: drivers.length,
      location: { latitude, longitude },
      radius: searchRadius
    }));
  }

  // Otherwise, return all available drivers with pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getAvailableDrivers(limit, offset);
  const total = await Driver.count({ status: 'online' });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get drivers with full details
 * @route   GET /api/drivers/details
 * @access  Private/Admin
 */
export const getDriversWithDetails = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getDriversWithDetails(limit, offset);
  const total = await Driver.count();
  
  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Create driver profile
 * @route   POST /api/drivers
 * @access  Private (can create own profile) / Admin (can create for any user)
 */
export const createDriver = asyncHandler(async (req: Request, res: Response) => {
  const {
    user_id,
    vehicle_id,
    status,
    kyc_status,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    vehicle_color,
    vehicle_plate,
    vehicle_capacity,
    license_number,
    bank_name,
    account_number,
    account_holder,
  } = req.body;

  // Security check: Non-admin users can only create their own driver profile
  if (req.user?.role !== 'admin' && req.user?.userId !== user_id) {
    throw ApiError.forbidden('You can only create your own driver profile');
  }

  // Check if user is already a driver
  const existingDriver = await Driver.findByUserId(user_id);
  if (existingDriver) {
    throw ApiError.conflict('User is already registered as a driver');
  }

  const driverId = await Driver.create({
    user_id,
    vehicle_id,
    status: status || 'offline',
    kyc_status: kyc_status || 'pending',
    rating_avg: 5.0,
    total_trips: 0,
    // Vehicle info
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    vehicle_color,
    vehicle_plate,
    vehicle_capacity,
    // License
    license_number,
    // Banking
    bank_name,
    account_number,
    account_holder,
  });

  // Note: User role will be updated to 'driver' only when admin approves (kyc_status = 'approved')
  // This keeps the user as 'passenger' during the verification process

  const driver = await Driver.findById(driverId);
  res.status(201).json(ApiResponse.success(driver));
});

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private
 */
export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { vehicle_id, status, kyc_status, rating_avg, total_trips } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateById(driverId, {
    vehicle_id,
    status,
    kyc_status,
    rating_avg,
    total_trips
  });

  const updatedDriver = await Driver.findById(driverId);
  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Update driver status
 * @route   PATCH /api/drivers/:id/status
 * @access  Private
 */
export const updateDriverStatus = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { status } = req.body as { status: DriverStatus };

  if (!['offline', 'online', 'busy', 'suspended'].includes(status)) {
    throw ApiError.badRequest('Invalid status value');
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateStatus(driverId, status);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Update driver rating
 * @route   PATCH /api/drivers/:id/rating
 * @access  Private
 */
export const updateDriverRating = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { rating_avg, total_trips } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.updateRating(driverId, rating_avg, total_trips);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Increment driver trips
 * @route   POST /api/drivers/:id/increment-trips
 * @access  Private
 */
export const incrementDriverTrips = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.incrementTrips(driverId);
  const updatedDriver = await Driver.findById(driverId);

  res.json(ApiResponse.success(updatedDriver));
});

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  Private/Admin
 */
export const deleteDriver = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  await Driver.deleteById(driverId);
  res.json(ApiResponse.success({ message: 'Driver deleted successfully' }));
});

/**
 * @desc    Get pending KYC drivers
 * @route   GET /api/drivers/kyc/pending
 * @access  Private/Admin
 */
export const getPendingKycDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const drivers = await Driver.getPendingKycDrivers(limit, offset);
  const total = await Driver.count({ kyc_status: 'pending' });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Get drivers by KYC status
 * @route   GET /api/drivers/kyc/:status
 * @access  Private/Admin
 */
export const getDriversByKycStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.params.status as 'pending' | 'approved' | 'rejected';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Invalid KYC status. Must be: pending, approved, or rejected');
  }

  const drivers = await Driver.getByKycStatus(status, limit, offset);
  const total = await Driver.count({ kyc_status: status });

  res.json(ApiResponse.paginated(drivers, page, limit, total));
});

/**
 * @desc    Approve driver KYC
 * @route   PATCH /api/drivers/:id/kyc/approve
 * @access  Private/Admin
 */
export const approveDriverKyc = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  if (driver.kyc_status === 'approved') {
    throw ApiError.badRequest('Driver KYC is already approved');
  }

  const adminId = (req.user as any).userId;

  // Approve the driver KYC
  await Driver.approveKyc(driverId, adminId);
  
  // Update user role to 'driver' now that they're approved
  await User.updateById(driver.user_id, { role: 'driver' });
  
  const updatedDriver = await Driver.findById(driverId);

  // Log admin action
  await logAdminAction({
    adminId,
    action: 'driver_kyc_approved',
    resourceType: 'driver',
    resourceId: driverId,
    details: { driver_name: updatedDriver?.license_number, user_id: driver.user_id },
    req,
  });

  res.json(ApiResponse.success(updatedDriver, 'Driver KYC approved successfully'));
});

/**
 * @desc    Reject driver KYC
 * @route   PATCH /api/drivers/:id/kyc/reject
 * @access  Private/Admin
 */
export const rejectDriverKyc = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const { reason } = req.body;

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver');
  }

  if (driver.kyc_status === 'rejected') {
    throw ApiError.badRequest('Driver KYC is already rejected');
  }

  const adminId = (req.user as any).userId;

  // Reject the driver KYC
  await Driver.rejectKyc(driverId, adminId, reason);
  
  // Keep user role as 'passenger' since they're rejected
  // (In case they were approved before and are being rejected again)
  await User.updateById(driver.user_id, { role: 'passenger' });
  
  const updatedDriver = await Driver.findById(driverId);

  // Log admin action
  await logAdminAction({
    adminId,
    action: 'driver_kyc_rejected',
    resourceType: 'driver',
    resourceId: driverId,
    details: { reason, driver_name: updatedDriver?.license_number, user_id: driver.user_id },
    req,
  });

  // TODO: Send notification to driver with rejection reason
  // await notificationService.sendKycRejection(driver.user_id, reason);

  res.json(ApiResponse.success(updatedDriver, 'Driver KYC rejected'));
});

/**
 * @desc    Upload KYC documents for a driver
 * @route   POST /api/drivers/:id/documents/upload
 * @access  Private (Driver own or Admin)
 */
export const uploadKycDocuments = asyncHandler(async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.id);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Vérifier que le driver existe
  const driver = await Driver.findById(driverId);
  if (!driver) {
    // Nettoyer les fichiers uploadés
    if (files) {
      const allFiles = Object.values(files).flat();
      cleanupUploadedFiles(allFiles);
    }
    throw ApiError.notFound('Driver');
  }

  // Vérifier les permissions (driver peut uploader ses propres docs, admin peut tout)
  const userId = (req.user as any).userId;
  const userRole = (req.user as any).role;
  
  if (userRole !== 'admin' && driver.user_id !== userId) {
    // Nettoyer les fichiers uploadés
    if (files) {
      const allFiles = Object.values(files).flat();
      cleanupUploadedFiles(allFiles);
    }
    throw ApiError.forbidden('You can only upload your own documents');
  }

  // Construire l'objet des URLs des documents
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  const documents: any = {};

  if (files['photo_profil']?.[0]) {
    documents.photo_profil = `${baseUrl}/uploads/kyc/${files['photo_profil'][0].filename}`;
  }
  if (files['photo_cni_recto']?.[0]) {
    documents.photo_cni_recto = `${baseUrl}/uploads/kyc/${files['photo_cni_recto'][0].filename}`;
  }
  if (files['photo_cni_verso']?.[0]) {
    documents.photo_cni_verso = `${baseUrl}/uploads/kyc/${files['photo_cni_verso'][0].filename}`;
  }
  if (files['photo_permis_recto']?.[0]) {
    documents.photo_permis_recto = `${baseUrl}/uploads/kyc/${files['photo_permis_recto'][0].filename}`;
  }
  if (files['photo_permis_verso']?.[0]) {
    documents.photo_permis_verso = `${baseUrl}/uploads/kyc/${files['photo_permis_verso'][0].filename}`;
  }
  if (files['photo_carte_grise']?.[0]) {
    documents.photo_carte_grise = `${baseUrl}/uploads/kyc/${files['photo_carte_grise'][0].filename}`;
  }
  if (files['photo_vehicule']?.[0]) {
    documents.photo_vehicule = `${baseUrl}/uploads/kyc/${files['photo_vehicule'][0].filename}`;
  }

  // Si aucun fichier n'a été uploadé
  if (Object.keys(documents).length === 0) {
    throw ApiError.badRequest('No valid files uploaded');
  }

  // Récupérer les documents existants et les fusionner avec les nouveaux
  let existingDocuments = {};
  if (driver.kyc_documents) {
    try {
      existingDocuments = typeof driver.kyc_documents === 'string' 
        ? JSON.parse(driver.kyc_documents)
        : driver.kyc_documents;
    } catch (error) {
      console.error('Error parsing existing documents:', error);
    }
  }

  const updatedDocuments = {
    ...existingDocuments,
    ...documents
  };

  // Mettre à jour les documents KYC dans la base de données
  await Driver.updateKycDocuments(driverId, updatedDocuments);

  // Si tous les documents requis sont présents, mettre le statut KYC en "pending"
  const requiredDocs = ['photo_profil', 'photo_cni_recto', 'photo_cni_verso', 
                        'photo_permis_recto', 'photo_permis_verso', 
                        'photo_carte_grise', 'photo_vehicule'];
  
  const allDocsPresent = requiredDocs.every(doc => updatedDocuments[doc]);
  
  if (allDocsPresent && driver.kyc_status !== 'approved') {
    // Réinitialiser le statut KYC à "pending" et effacer la raison de rejet
    await Driver.updateById(driverId, {
      kyc_status: 'pending',
      kyc_rejection_reason: null,
      kyc_rejected_at: null
    });
  }

  const updatedDriver = await Driver.findById(driverId);

  // Log l'action
  await logAdminAction({
    adminId: userId,
    action: 'driver_documents_uploaded',
    resourceType: 'driver',
    resourceId: driverId,
    details: { 
      uploaded_documents: Object.keys(documents),
      total_documents: Object.keys(updatedDocuments).length,
      all_required_present: allDocsPresent
    },
    req,
  });

  res.json(ApiResponse.success({
    driver: updatedDriver,
    documents: updatedDocuments,
    uploaded: Object.keys(documents),
    kyc_complete: allDocsPresent
  }, 'Documents uploaded successfully'));
});
