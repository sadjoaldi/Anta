import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      ApiResponse.error(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later'
      )
    );
  }
});

/**
 * Strict rate limiter for auth endpoints
 * 20 attempts per 15 minutes per IP (dev-friendly)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      ApiResponse.error(
        'AUTH_RATE_LIMIT_EXCEEDED',
        'Too many authentication attempts. Please try again in 15 minutes.'
      )
    );
  }
});

/**
 * Create rate limiter
 * 20 requests per hour per IP
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many resources created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      ApiResponse.error(
        'CREATE_RATE_LIMIT_EXCEEDED',
        'Too many create operations. Please try again later.'
      )
    );
  }
});
