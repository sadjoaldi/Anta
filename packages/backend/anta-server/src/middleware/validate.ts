import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to validate request data against Zod schema
 * Can validate body, query, and params
 */
export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into readable format
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw ApiError.badRequest('Validation failed', { errors });
      }
      
      next(error);
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw ApiError.badRequest('Validation failed', { errors });
      }
      
      next(error);
    }
  };
};

/**
 * Validate only query parameters
 */
export const validateQuery = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw ApiError.badRequest('Validation failed', { errors });
      }
      
      next(error);
    }
  };
};

/**
 * Validate only URL parameters
 */
export const validateParams = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw ApiError.badRequest('Validation failed', { errors });
      }
      
      next(error);
    }
  };
};
