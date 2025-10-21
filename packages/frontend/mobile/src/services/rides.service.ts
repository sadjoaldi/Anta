/**
 * Rides Service (Frontend)
 * API calls for ride management
 */

import apiClient from './api.client';

export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateRideParams {
  // passengerId is extracted from JWT token on backend
  driverId: number;
  originLat: number;
  originLng: number;
  originAddress: string;
  destLat: number;
  destLng: number;
  destAddress: string;
  distance: number; // meters
  duration: number; // seconds
  estimatedPrice: number;
  vehicleType: string;
  passengers: number;
  notes?: string;
}

export interface Ride {
  id: number;
  passenger_id: number;
  driver_id: number;
  origin_lat: number;
  origin_lng: number;
  origin_address: string;
  dest_lat: number;
  dest_lng: number;
  dest_address: string;
  distance: number;
  duration: number;
  estimated_price: number;
  final_price?: number;
  vehicle_type: string;
  passengers: number;
  notes?: string;
  status: RideStatus;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  // Populated by backend joins
  driver_name?: string;
  driver_phone?: string;
  passenger_name?: string;
  passenger_phone?: string;
}

class RidesService {
  /**
   * Create a new ride request
   */
  async createRide(params: CreateRideParams): Promise<Ride> {
    // apiClient.post already extracts .data.data, so response is directly the Ride
    const ride = await apiClient.post<Ride>('/rides/create', params);
    return ride;
  }

  /**
   * Get ride details
   */
  async getRide(rideId: number): Promise<Ride> {
    const ride = await apiClient.get<Ride>(`/rides/${rideId}`);
    return ride;
  }

  /**
   * Update ride status
   */
  async updateRideStatus(
    rideId: number,
    status: RideStatus,
    finalPrice?: number
  ): Promise<Ride> {
    const ride = await apiClient.patch<Ride>(`/rides/${rideId}/status`, { status, finalPrice });
    return ride;
  }

  /**
   * Accept ride (driver)
   */
  async acceptRide(rideId: number, driverId: number): Promise<Ride> {
    const ride = await apiClient.post<Ride>(`/rides/${rideId}/accept`, { driverId });
    return ride;
  }

  /**
   * Start ride (driver)
   */
  async startRide(rideId: number, driverId: number): Promise<Ride> {
    const ride = await apiClient.post<Ride>(`/rides/${rideId}/start`, { driverId });
    return ride;
  }

  /**
   * Complete ride (driver)
   */
  async completeRide(
    rideId: number,
    driverId: number,
    finalPrice?: number
  ): Promise<Ride> {
    const ride = await apiClient.post<Ride>(`/rides/${rideId}/complete`, { driverId, finalPrice });
    return ride;
  }

  /**
   * Cancel ride
   */
  async cancelRide(
    rideId: number,
    userId: number,
    userType: 'passenger' | 'driver'
  ): Promise<Ride> {
    const ride = await apiClient.post<Ride>(`/rides/${rideId}/cancel`, { userId, userType });
    return ride;
  }

  /**
   * Get passenger ride history
   */
  async getPassengerRides(
    passengerId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Ride[]> {
    const rides = await apiClient.get<Ride[]>(`/rides/passenger/${passengerId}/history?limit=${limit}&offset=${offset}`);
    return rides;
  }

  /**
   * Get driver ride history
   */
  async getDriverRides(
    driverId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Ride[]> {
    const rides = await apiClient.get<Ride[]>(`/rides/driver/${driverId}/history?limit=${limit}&offset=${offset}`);
    return rides;
  }

  /**
   * Get active ride for passenger
   */
  async getActivePassengerRide(passengerId: number): Promise<Ride | null> {
    try {
      const response = await apiClient.get<{ success: boolean; ride: Ride | null }>(
        `/rides/passenger/${passengerId}/active`
      );
      return response?.ride || null;
    } catch (error) {
      console.error('Error fetching active ride:', error);
      return null;
    }
  }

  /**
   * Get active ride for driver
   */
  async getActiveDriverRide(driverId: number): Promise<Ride | null> {
    try {
      const response = await apiClient.get<{ success: boolean; ride: Ride | null }>(
        `/rides/driver/${driverId}/active`
      );
      return response?.ride || null;
    } catch (error) {
      console.error('Error fetching active driver ride:', error);
      return null;
    }
  }

  /**
   * Get pending rides for driver
   */
  async getDriverPendingRides(driverId: number): Promise<Ride[]> {
    const rides = await apiClient.get<Ride[]>(`/rides/driver/${driverId}/pending`);
    return rides;
  }
}

export default new RidesService();
