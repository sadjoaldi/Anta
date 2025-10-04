import { z } from 'zod';

/**
 * Driver status enum
 */
const driverStatusSchema = z.enum(['online', 'offline', 'busy', 'inactive']);

/**
 * KYC status enum
 */
const kycStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * Create driver schema
 */
export const createDriverSchema = z.object({
  body: z.object({
    user_id: z.number().int().positive('User ID must be a positive integer'),
    license_number: z.string().min(3).max(50).optional(),
    license_expiry: z.string().datetime().or(z.date()).optional(),
    vehicle_type: z.enum(['sedan', 'suv', 'van', 'luxury']).optional(),
    status: driverStatusSchema.optional(),
    kyc_status: kycStatusSchema.optional(),
    kyc_documents: z.string().optional(),
    rating_avg: z.number().min(0).max(5).optional(),
    rating_count: z.number().int().min(0).optional(),
    total_trips: z.number().int().min(0).optional(),
    total_earnings: z.number().min(0).optional()
  })
});

/**
 * Update driver schema
 */
export const updateDriverSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  }),
  body: z.object({
    license_number: z.string().min(3).max(50).optional(),
    license_expiry: z.string().datetime().or(z.date()).optional(),
    vehicle_type: z.enum(['sedan', 'suv', 'van', 'luxury']).optional(),
    status: driverStatusSchema.optional(),
    kyc_status: kycStatusSchema.optional(),
    kyc_documents: z.string().optional(),
    rating_avg: z.number().min(0).max(5).optional(),
    rating_count: z.number().int().min(0).optional(),
    total_trips: z.number().int().min(0).optional(),
    total_earnings: z.number().min(0).optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })
});

/**
 * Update driver status schema
 */
export const updateDriverStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  }),
  body: z.object({
    status: driverStatusSchema
  })
});

/**
 * Update driver rating schema
 */
export const updateDriverRatingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  }),
  body: z.object({
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5')
  })
});

/**
 * Get driver by ID schema
 */
export const getDriverSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  })
});

/**
 * Get driver by user ID schema
 */
export const getDriverByUserIdSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, 'User ID must be a number')
  })
});

/**
 * Get drivers by status schema
 */
export const getDriversByStatusSchema = z.object({
  params: z.object({
    status: driverStatusSchema
  })
});

/**
 * Delete driver schema
 */
export const deleteDriverSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  })
});

// Export types
export type CreateDriverInput = z.infer<typeof createDriverSchema>['body'];
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>['body'];
export type UpdateDriverStatusInput = z.infer<typeof updateDriverStatusSchema>['body'];
export type UpdateDriverRatingInput = z.infer<typeof updateDriverRatingSchema>['body'];
