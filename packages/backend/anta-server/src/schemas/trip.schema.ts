import { z } from 'zod';

/**
 * Trip status enum
 */
const tripStatusSchema = z.enum([
  'pending',
  'accepted',
  'driver_assigned',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled'
]);

/**
 * Coordinates schema
 */
const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

/**
 * Create trip schema
 */
export const createTripSchema = z.object({
  body: z.object({
    passenger_id: z.number().int().positive('Passenger ID must be a positive integer'),
    driver_id: z.number().int().positive().optional(),
    origin_lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    origin_lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    origin_address: z.string().min(5).max(255),
    destination_lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    destination_lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    destination_address: z.string().min(5).max(255),
    estimated_distance: z.number().min(0).optional(),
    estimated_duration: z.number().int().min(0).optional(),
    estimated_price: z.number().min(0).optional(),
    vehicle_type: z.enum(['sedan', 'suv', 'van', 'luxury']).optional(),
    status: tripStatusSchema.optional()
  })
});

/**
 * Update trip schema
 */
export const updateTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  }),
  body: z.object({
    driver_id: z.number().int().positive().optional(),
    status: tripStatusSchema.optional(),
    actual_distance: z.number().min(0).optional(),
    actual_duration: z.number().int().min(0).optional(),
    final_price: z.number().min(0).optional(),
    driver_earnings: z.number().min(0).optional(),
    commission: z.number().min(0).optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })
});

/**
 * Update trip status schema
 */
export const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  }),
  body: z.object({
    status: tripStatusSchema
  })
});

/**
 * Assign driver to trip schema
 */
export const assignDriverSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  }),
  body: z.object({
    driver_id: z.number().int().positive('Driver ID must be a positive integer')
  })
});

/**
 * Complete trip schema
 */
export const completeTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  }),
  body: z.object({
    actual_distance: z.number().min(0),
    actual_duration: z.number().int().min(0),
    final_price: z.number().min(0),
    driver_earnings: z.number().min(0).optional(),
    commission: z.number().min(0).optional()
  })
});

/**
 * Cancel trip schema
 */
export const cancelTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  }),
  body: z.object({
    reason: z.string().min(5).max(500).optional()
  })
});

/**
 * Get trip by ID schema
 */
export const getTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  })
});

/**
 * Get trips by passenger schema
 */
export const getTripsByPassengerSchema = z.object({
  params: z.object({
    passengerId: z.string().regex(/^\d+$/, 'Passenger ID must be a number')
  })
});

/**
 * Get trips by driver schema
 */
export const getTripsByDriverSchema = z.object({
  params: z.object({
    driverId: z.string().regex(/^\d+$/, 'Driver ID must be a number')
  })
});

/**
 * Get trips by status schema
 */
export const getTripsByStatusSchema = z.object({
  params: z.object({
    status: tripStatusSchema
  })
});

/**
 * Get user trip history schema
 */
export const getUserTripHistorySchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, 'User ID must be a number')
  })
});

/**
 * Delete trip schema
 */
export const deleteTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Trip ID must be a number')
  })
});

// Export types
export type CreateTripInput = z.infer<typeof createTripSchema>['body'];
export type UpdateTripInput = z.infer<typeof updateTripSchema>['body'];
export type UpdateTripStatusInput = z.infer<typeof updateTripStatusSchema>['body'];
export type AssignDriverInput = z.infer<typeof assignDriverSchema>['body'];
export type CompleteTripInput = z.infer<typeof completeTripSchema>['body'];
export type CancelTripInput = z.infer<typeof cancelTripSchema>['body'];
