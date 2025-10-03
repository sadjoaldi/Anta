import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate requests
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        return next(ApiError.unauthorized('Token expired'));
      }
      if (error.message === 'Invalid token') {
        return next(ApiError.unauthorized('Invalid token'));
      }
    }
    next(ApiError.unauthorized('Authentication failed'));
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch {
    // If token is invalid, just continue without user
    next();
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...roles: Array<'passenger' | 'driver' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role || 'passenger';
    
    if (!roles.includes(userRole)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource
 */
export function requireOwnership(userIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const resourceUserId = parseInt(req.params[userIdParam]);
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.user.userId !== resourceUserId) {
      return next(ApiError.forbidden('You can only access your own resources'));
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is driver
 */
export const requireDriver = requireRole('driver', 'admin');
