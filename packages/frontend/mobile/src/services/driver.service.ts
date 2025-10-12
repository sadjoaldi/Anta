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
}

export default new DriverService();
