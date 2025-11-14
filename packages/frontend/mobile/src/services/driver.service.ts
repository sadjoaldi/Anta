/**
 * Driver Service
 * Handles driver-related API calls
 */

import apiClient from "./api.client";

export interface Driver {
  id: number;
  user_id: number;
  status: "offline" | "online" | "busy" | "suspended";
  rating_avg: number;
  total_trips: number;
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate?: string;
  current_latitude?: number;
  current_longitude?: number;
  location_updated_at?: string;
  distance?: number; // Distance from user in meters
  user?: {
    id: number;
    name: string;
    phone: string;
  };
}

export interface AvailableDriversResponse {
  drivers: Driver[];
  count: number;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
}

class DriverService {
  /**
   * Get available drivers near a location
   */
  async getAvailableDrivers(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<AvailableDriversResponse> {
    const response = await apiClient.get<AvailableDriversResponse>(
      `/drivers/available?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    return response;
  }

  /**
   * Get driver details by driver_id
   */
  async getDriverById(driverId: number): Promise<Driver | null> {
    try {
      const driver = await apiClient.get<Driver>(`/drivers/${driverId}`);
      return driver;
    } catch (error) {
      console.error('Error fetching driver by id:', error);
      return null;
    }
  }

  /**
   * Get driver details by user_id
   */
  async getDriverByUserId(userId: number): Promise<Driver | null> {
    try {
      const driver = await apiClient.get<Driver>(`/drivers/user/${userId}`);
      return driver;
    } catch (error) {
      console.error('Error fetching driver details:', error);
      return null;
    }
  }

  /**
   * Create a driver profile with vehicle and license info
   */
  async createDriverProfile(data: {
    user_id: number;
    vehicle_type: string;
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_color: string;
    vehicle_plate: string;
    vehicle_capacity?: number;
    license_number: string;
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
  }): Promise<Driver> {
    const driver = await apiClient.post<Driver>('/drivers', data);
    return driver;
  }
}

export default new DriverService();
