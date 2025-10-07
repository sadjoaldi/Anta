import { z } from 'zod';

/**
 * Password validation schema
 * Simplified for development: just minimum 8 characters
 * TODO: Restore strict validation for production
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

/**
 * Strict password validation (for production)
 * Uncomment to enforce strong passwords
 */
// const passwordSchema = z
//   .string()
//   .min(8, 'Password must be at least 8 characters')
//   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//   .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//   .regex(/[0-9]/, 'Password must contain at least one number')
//   .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Phone number validation (Guinea format)
 * Format: +224XXXXXXXXX (9 digits after country code)
 */
const phoneSchema = z
  .string()
  .regex(/^\+224\d{9}$/, 'Phone must be a valid Guinea number (+224XXXXXXXXX)');

/**
 * Register schema
 */
export const registerSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    email: z.string().email('Invalid email address').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    password: passwordSchema,
    role: z.enum(['passenger', 'driver', 'admin']).optional()
  })
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    password: z.string().min(1, 'Password is required')
  })
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema
  })
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
