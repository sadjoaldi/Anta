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

export interface CreateDriverProfileData {
  user_id: number;
  // Vehicle info
  vehicle_type: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate: string;
  vehicle_capacity?: number;
  // Driver license
  license_number: string;
  // Banking info
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
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
   * Create complete driver profile (for passenger becoming driver)
   */
  async createDriverProfile(data: CreateDriverProfileData): Promise<Driver> {
    return await apiClient.post<Driver>(API_ENDPOINTS.drivers.base, {
      user_id: data.user_id,
      status: 'offline',
      kyc_status: 'pending',
      rating_avg: 5.0,
      total_trips: 0,
      // Vehicle info
      vehicle_type: data.vehicle_type,
      vehicle_brand: data.vehicle_brand,
      vehicle_model: data.vehicle_model,
      vehicle_color: data.vehicle_color,
      vehicle_plate: data.vehicle_plate,
      vehicle_capacity: data.vehicle_capacity,
      // License
      license_number: data.license_number,
      // Banking
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder: data.account_holder,
    });
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
