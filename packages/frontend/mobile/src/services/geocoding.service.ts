/**
 * Geocoding Service for ANTA Mobile
 * Uses backend proxy for address search in Guinea
 */

import apiClient from './api.client';

export interface PlaceSuggestion {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
}

class GeocodingService {
  /**
   * Search for places in Guinea
   * @param query Search query
   * @param limit Maximum number of results (default: 10)
   */
  async searchPlaces(query: string, limit: number = 10): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    try {
      const response = await apiClient.get<PlaceSuggestion[]>(
        `/geocoding/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Geocoding search error:', error);
      return [];
    }
  }

  /**
   * Search places near a specific location
   */
  async searchNearby(
    query: string,
    latitude: number,
    longitude: number,
    limit: number = 10
  ): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    try {
      const response = await apiClient.get<PlaceSuggestion[]>(
        `/geocoding/search-nearby?q=${encodeURIComponent(query)}&lat=${latitude}&lng=${longitude}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Nearby search error:', error);
      return [];
    }
  }

  /**
   * Reverse geocoding: Get address from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await apiClient.get<{ address: string }>(
        `/geocoding/reverse?lat=${latitude}&lng=${longitude}`
      );
      return response.address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export default new GeocodingService();
