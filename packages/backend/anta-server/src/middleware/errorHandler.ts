import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('API Error:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.code, err.message, err.details)
    );
  }

  // Handle validation errors (if using a validation library like Joi or Zod)
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      ApiResponse.error('VALIDATION_ERROR', 'Validation failed', err.details)
    );
  }

  // Handle database errors
  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    return res.status(409).json(
      ApiResponse.error('DUPLICATE_ENTRY', 'Resource already exists')
    );
  }

  // Default to 500 internal server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  res.status(statusCode).json(
    ApiResponse.error('INTERNAL_ERROR', message, 
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
}

export default errorHandler;
