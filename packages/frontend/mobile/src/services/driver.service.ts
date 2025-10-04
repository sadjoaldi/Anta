/**
 * Driver Service for ANTA Mobile
 * Handles all driver-related API calls
 */

import apiClient from './api.client';
import { API_ENDPOINTS } from './api.config';
import { Driver } from '../types/api.types';

export interface UpdateDriverStatusData {
  status: 'online' | 'offline' | 'busy' | 'suspended';
}

export interface UpdateDriverRatingData {
  rating_avg: number;
}

class DriverService {
  /**
   * Get driver by ID
   */
  async getDriverById(id: number): Promise<Driver> {
    return await apiClient.get<Driver>(API_ENDPOINTS.drivers.byId(id));
  }

  /**
   * Get driver by user ID
   */
  async getDriverByUserId(userId: number): Promise<Driver> {
    return await apiClient.get<Driver>(API_ENDPOINTS.drivers.byUserId(userId));
  }

  /**
   * Get online drivers
   */
  async getOnlineDrivers(): Promise<Driver[]> {
    return await apiClient.get<Driver[]>(API_ENDPOINTS.drivers.online);
  }

  /**
   * Get drivers by status
   */
  async getDriversByStatus(status: string): Promise<Driver[]> {
    return await apiClient.get<Driver[]>(
      API_ENDPOINTS.drivers.byStatus(status)
    );
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(
    driverId: number,
    data: UpdateDriverStatusData
  ): Promise<Driver> {
    return await apiClient.patch<Driver>(
      API_ENDPOINTS.drivers.updateStatus(driverId),
      data
    );
  }

  /**
   * Update driver rating
   */
  async updateDriverRating(
    driverId: number,
    data: UpdateDriverRatingData
  ): Promise<Driver> {
    return await apiClient.patch<Driver>(
      API_ENDPOINTS.drivers.updateRating(driverId),
      data
    );
  }

  /**
   * Get all drivers (admin)
   */
  async getAllDrivers(): Promise<Driver[]> {
    return await apiClient.get<Driver[]>(API_ENDPOINTS.drivers.base);
  }

  /**
   * Create driver profile
   */
  async createDriver(data: Partial<Driver>): Promise<Driver> {
    return await apiClient.post<Driver>(API_ENDPOINTS.drivers.base, data);
  }

  /**
   * Update driver profile
   */
  async updateDriver(driverId: number, data: Partial<Driver>): Promise<Driver> {
    return await apiClient.put<Driver>(
      API_ENDPOINTS.drivers.byId(driverId),
      data
    );
  }

  /**
   * Delete driver profile
   */
  async deleteDriver(driverId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.drivers.byId(driverId));
  }
}

export default new DriverService();
