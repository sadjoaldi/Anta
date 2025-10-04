/**
 * Trip Service for ANTA Mobile
 * Handles all trip-related API calls
 */

import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';

export interface Trip {
  id: number;
  passenger_id: number;
  driver_id?: number;
  vehicle_id?: number;
  origin_lat: number;
  origin_lng: number;
  origin_text: string;
  dest_lat: number;
  dest_lng: number;
  dest_text: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  price_estimated: number;
  price_final?: number;
  distance_m: number;
  duration_s: number;
  payment_method?: 'cash' | 'card' | 'wallet' | 'promo';
  payment_status: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface CreateTripData {
  passenger_id: number;
  origin_lat: number;
  origin_lng: number;
  origin_text: string;
  dest_lat: number;
  dest_lng: number;
  dest_text: string;
  price_estimated: number;
  distance_m: number;
  duration_s: number;
  payment_method?: 'cash' | 'card' | 'wallet' | 'promo';
}

export interface AssignDriverData {
  driver_id: number;
}

export interface CompleteTripData {
  price_final: number;
  distance_m: number;
  duration_s: number;
}

export interface CancelTripData {
  cancellation_reason?: string;
}

class TripService {
  /**
   * Create new trip
   */
  async createTrip(data: CreateTripData): Promise<Trip> {
    return await apiClient.post<Trip>(API_ENDPOINTS.trips.base, data);
  }

  /**
   * Get trip by ID
   */
  async getTripById(id: number): Promise<Trip> {
    return await apiClient.get<Trip>(API_ENDPOINTS.trips.byId(id));
  }

  /**
   * Get trip details
   */
  async getTripDetails(id: number): Promise<Trip> {
    return await apiClient.get<Trip>(API_ENDPOINTS.trips.details(id));
  }

  /**
   * Get trips by passenger
   */
  async getTripsByPassenger(passengerId: number): Promise<Trip[]> {
    return await apiClient.get<Trip[]>(
      API_ENDPOINTS.trips.byPassenger(passengerId)
    );
  }

  /**
   * Get trips by driver
   */
  async getTripsByDriver(driverId: number): Promise<Trip[]> {
    return await apiClient.get<Trip[]>(API_ENDPOINTS.trips.byDriver(driverId));
  }

  /**
   * Get user trip history
   */
  async getUserHistory(userId: number): Promise<Trip[]> {
    return await apiClient.get<Trip[]>(API_ENDPOINTS.trips.userHistory(userId));
  }

  /**
   * Get pending trips (for drivers)
   */
  async getPendingTrips(): Promise<Trip[]> {
    return await apiClient.get<Trip[]>(API_ENDPOINTS.trips.pending);
  }

  /**
   * Get trips by status
   */
  async getTripsByStatus(status: string): Promise<Trip[]> {
    return await apiClient.get<Trip[]>(API_ENDPOINTS.trips.byStatus(status));
  }

  /**
   * Assign driver to trip
   */
  async assignDriver(tripId: number, data: AssignDriverData): Promise<Trip> {
    return await apiClient.post<Trip>(API_ENDPOINTS.trips.assign(tripId), data);
  }

  /**
   * Complete trip
   */
  async completeTrip(tripId: number, data: CompleteTripData): Promise<Trip> {
    return await apiClient.post<Trip>(
      API_ENDPOINTS.trips.complete(tripId),
      data
    );
  }

  /**
   * Cancel trip
   */
  async cancelTrip(tripId: number, data?: CancelTripData): Promise<Trip> {
    return await apiClient.post<Trip>(API_ENDPOINTS.trips.cancel(tripId), data);
  }

  /**
   * Update trip
   */
  async updateTrip(tripId: number, data: Partial<Trip>): Promise<Trip> {
    return await apiClient.put<Trip>(API_ENDPOINTS.trips.byId(tripId), data);
  }

  /**
   * Delete trip
   */
  async deleteTrip(tripId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.trips.byId(tripId));
  }
}

export default new TripService();
