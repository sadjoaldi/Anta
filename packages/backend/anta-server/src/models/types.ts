// Enums
export type TripStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'promo';
export type DriverStatus = 'offline' | 'online' | 'busy' | 'suspended';
export type KycStatus = 'pending' | 'approved' | 'rejected';
export type VehicleType = 'sedan' | 'suv' | 'van' | 'bike' | 'lux';
export type VehicleStatus = 'pending' | 'active' | 'inactive' | 'banned';
export type OwnerType = 'user' | 'driver' | 'platform';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type DiscountType = 'percent' | 'flat';
export type PromotionType = 'percentage' | 'fixed_amount';

// Table interfaces
export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: number;
  phone: string;
  email?: string | null;
  name?: string | null;
  password_hash: string;
  role: UserRole;
  default_payment_method_id?: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date | null;
}

export interface Driver {
  id: number;
  user_id: number;
  vehicle_id?: number | null;
  status: DriverStatus;
  kyc_status: KycStatus;
  rating_avg: number;
  total_trips: number;
  // Vehicle information
  vehicle_type?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;
  vehicle_capacity?: number | null;
  // License information
  license_number?: string | null;
  // Banking information
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
}

export interface Vehicle {
  id: number;
  driver_id: number;
  type: VehicleType;
  model: string;
  color: string;
  capacity: number;
  status: VehicleStatus;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  started_at?: Date | null;
  ended_at?: Date | null;
  cancelled_at?: Date | null;
  cancellation_reason?: string | null;
}

export interface TripEvent {
  id: number;
  trip_id: number;
  lat?: number | null;
  lng?: number | null;
  event_type: string;
  created_at: Date;
}

export interface Payment {
  id: number;
  trip_id: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider_ref?: string | null;
  status: PaymentStatus;
  created_at: Date;
}

export interface Wallet {
  id: number;
  owner_type: OwnerType;
  owner_id: number;
  balance_cents: number;
  currency: string;
}

export interface Payout {
  id: number;
  driver_id: number;
  amount: number;
  status: PayoutStatus;
  created_at: Date;
}

export interface Rating {
  id: number;
  trip_id: number;
  from_user_id: number;
  to_user_id: number;
  rating: number;
  comment?: string | null;
}

export interface KycDocument {
  id: number;
  driver_id: number;
  storage_key: string;
  status: KycStatus;
  created_at: Date;
}

export interface Zone {
  id: number;
  name: string;
  base_fare: number;
  per_km: number;
  per_min: number;
  surge_multiplier: number;
}

export interface FareHistory {
  id: number;
  zone_id: number;
  start_date: Date;
  end_date?: Date | null;
  params_json: Record<string, any>;
}

export interface DeviceToken {
  id: number;
  user_id: number;
  platform: string;
  token: string;
  created_at: Date;
}

export interface SupportTicket {
  id: number;
  user_id?: number | null;
  driver_id?: number | null;
  subject: string;
  status: TicketStatus;
  created_at: Date;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  trip_id?: number | null;
  ticket_id?: number | null;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export interface AdminUser {
  id: number;
  name: string;
  role: string;
  permissions: Record<string, any>;
  created_at: Date;
}

export interface Setting {
  key: string;
  value: Record<string, any>;
  updated_at: Date;
}

export interface PromoCode {
  id: number;
  code: string;
  discount_type: DiscountType;
  value: number;
  active: boolean;
  usage_limit?: number | null;
  valid_from?: Date | null;
  valid_to?: Date | null;
}

export interface DriverLocationLive {
  driver_id: number;
  lat: number;
  lng: number;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: string;
  detail_json: Record<string, any>;
  created_at: Date;
}

export interface Session {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

// Insert types (without auto-generated fields)
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  created_at?: Date;
  updated_at?: Date;
};

export type DriverInsert = Omit<Driver, 'id'>;

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> & {
  created_at?: Date;
  updated_at?: Date;
};

export type TripInsert = Omit<Trip, 'id' | 'created_at'> & {
  created_at?: Date;
};

export type PaymentInsert = Omit<Payment, 'id' | 'created_at'> & {
  created_at?: Date;
};

export type RatingInsert = Omit<Rating, 'id'>;

export type SessionInsert = Omit<Session, 'id' | 'created_at'> & {
  created_at?: Date;
};

export interface Promotion {
  id: number;
  code: string;
  description?: string | null;
  type: PromotionType;
  value: number;
  min_trip_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  usage_per_user?: number | null;
  is_active: boolean;
  valid_from?: Date | null;
  valid_until?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PromotionUsage {
  id: number;
  promotion_id: number;
  user_id: number;
  trip_id?: number | null;
  discount_amount: number;
  used_at: Date;
}

export interface AdminLog {
  id: number;
  admin_id: number;
  action: string;
  resource_type: string;
  resource_id?: number | null;
  details?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: Date;
}

// Update types (all fields optional except id)
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type DriverUpdate = Partial<Omit<Driver, 'id'>>;
export type TripUpdate = Partial<Omit<Trip, 'id' | 'created_at'>>;
export type VehicleUpdate = Partial<Omit<Vehicle, 'id' | 'created_at'>>;
export type PromotionUpdate = Partial<Omit<Promotion, 'id' | 'created_at' | 'usage_count'>>;
