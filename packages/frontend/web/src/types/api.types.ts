/**
 * TypeScript types for ANTA Admin Dashboard
 */

export type UserRole = 'passenger' | 'driver' | 'admin';
export type DriverStatus = 'offline' | 'online' | 'busy' | 'suspended';
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface Driver {
  id: number;
  user_id: number;
  vehicle_id?: number | null;
  status: DriverStatus;
  kyc_status: KycStatus;
  rating_avg: number;
  total_trips: number;
  // Vehicle info
  vehicle_type?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;
  vehicle_capacity?: number | null;
  // License
  license_number?: string | null;
  // Banking
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
}

export interface DriverWithUser extends Driver {
  user: User;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}
