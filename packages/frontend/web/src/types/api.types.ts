/**
 * TypeScript types for ANTA Admin Dashboard
 */

export type UserRole = 'passenger' | 'driver' | 'admin';
export type DriverStatus = 'offline' | 'online' | 'busy' | 'suspended';
export type KycStatus = 'pending' | 'approved' | 'rejected';
export type TripStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'mobile_money' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

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

export interface Trip {
  id: number;
  passenger_id: number;
  driver_id?: number | null;
  vehicle_id?: number | null;
  origin_lat: number;
  origin_lng: number;
  origin_text: string;
  dest_lat: number;
  dest_lng: number;
  dest_text: string;
  status: TripStatus;
  price_estimated: number;
  price_final?: number | null;
  distance_m: number;
  duration_s: number;
  payment_method?: PaymentMethod | null;
  payment_status: PaymentStatus;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
}

export interface TripWithDetails extends Trip {
  passenger: User;
  driver?: User | null;
}

export interface Payment {
  id: number;
  trip_id: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider_ref?: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentWithTrip extends Payment {
  trip: Trip;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}
