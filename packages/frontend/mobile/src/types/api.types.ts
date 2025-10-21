/**
 * API Types for ANTA Mobile
 * Backend API response types
 */

export interface User {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: 'passenger' | 'driver' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  driver?: Driver; // Populated for drivers
}

export interface Driver {
  id: number;
  user_id: number;
  vehicle_id?: number;
  status: 'offline' | 'online' | 'busy' | 'suspended';
  kyc_status: 'pending' | 'approved' | 'rejected';
  rating_avg: number;
  total_trips: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  driver?: Driver;
}

export interface RegisterData {
  phone: string;
  name: string;
  password: string;
  email?: string;
  role?: 'passenger' | 'driver';
}

export interface LoginData {
  phone: string;
  password: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * API Error
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
