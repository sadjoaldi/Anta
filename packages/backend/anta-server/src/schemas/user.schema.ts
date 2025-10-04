import { z } from 'zod';

/**
 * Phone number validation (Guinea format)
 * Format: +224XXXXXXXXX (9 digits after country code)
 */
const phoneSchema = z
  .string()
  .regex(/^\+224\d{9}$/, 'Phone must be a valid Guinea number (+224XXXXXXXXX)');

/**
 * Create user schema
 */
export const createUserSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    password_hash: z.string().optional(), // Will be hashed
    is_active: z.boolean().optional()
  })
});

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number')
  }),
  body: z.object({
    phone: phoneSchema.optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    name: z.string().min(2).max(100).optional(),
    is_active: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })
});

/**
 * Get user by ID schema
 */
export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number')
  })
});

/**
 * Get user by phone schema
 */
export const getUserByPhoneSchema = z.object({
  params: z.object({
    phone: phoneSchema
  })
});

/**
 * Get user by email schema
 */
export const getUserByEmailSchema = z.object({
  params: z.object({
    email: z.string().email('Invalid email address')
  })
});

/**
 * Delete user schema
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number')
  })
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
