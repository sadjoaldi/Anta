/**
 * Trip Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { Trip, TripWithDetails } from '../types/api.types';

class TripService {
  /**
   * Get all trips with pagination and filters
   */
  async getTrips(params?: {
    page?: number;
    limit?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: TripWithDetails[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const url = `/trips?${queryParams.toString()}`;
    return await apiClient.getPaginated<TripWithDetails[]>(url);
  }

  /**
   * Get trip by ID with details
   */
  async getTripById(id: number): Promise<TripWithDetails> {
    return await apiClient.get<TripWithDetails>(`/trips/${id}/details`);
  }

  /**
   * Get trips by status
   */
  async getTripsByStatus(
    status: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: TripWithDetails[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/trips/status/${status}?${queryParams.toString()}`;
    return await apiClient.getPaginated<TripWithDetails[]>(url);
  }

  /**
   * Cancel trip (admin)
   */
  async cancelTrip(tripId: number, reason?: string): Promise<Trip> {
    return await apiClient.post<Trip>(`/trips/${tripId}/cancel`, {
      cancellation_reason: reason,
    });
  }

  /**
   * Delete trip (admin only)
   */
  async deleteTrip(tripId: number): Promise<void> {
    return await apiClient.delete(`/trips/${tripId}`);
  }
}

export default new TripService();
