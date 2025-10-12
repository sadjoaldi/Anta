/**
 * Geocoding Service (Backend)
 * Proxies requests to Nominatim API for Guinea addresses
 */

import axios, { AxiosInstance } from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface PlaceSuggestion {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
}

class GeocodingService {
  private axiosInstance: AxiosInstance;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: NOMINATIM_BASE_URL,
      timeout: 10000,
      headers: {
        'User-Agent': 'ANTA-Server/1.0 (taxi-app-guinea)', // Required by Nominatim
      },
    });

    this.requestCache = new Map();
  }

  /**
   * Search for places in Guinea
   */
  async searchPlaces(query: string, limit: number = 10): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const cacheKey = `search:${query}:${limit}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<GeocodingResult[]>('/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit,
          countrycodes: 'gn', // Restrict to Guinea
          'accept-language': 'fr', // French results
        },
      });

      const results = response.data.map((result) => this.mapToSuggestion(result));
      
      // Cache results
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error('Geocoding search error:', error);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Search places near a location
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

    const cacheKey = `nearby:${query}:${latitude}:${longitude}:${limit}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<GeocodingResult[]>('/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit,
          countrycodes: 'gn',
          'accept-language': 'fr',
          // Bias results towards this location
          lat: latitude,
          lon: longitude,
        },
      });

      const results = response.data.map((result) => this.mapToSuggestion(result));
      
      // Cache results
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error('Nearby search error:', error);
      throw new Error('Failed to search nearby places');
    }
  }

  /**
   * Reverse geocoding: Get address from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    const cacheKey = `reverse:${latitude}:${longitude}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<GeocodingResult>('/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
          'accept-language': 'fr',
        },
      });

      const address = response.data.display_name;
      
      // Cache result
      this.setCache(cacheKey, address);
      
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Map Nominatim result to PlaceSuggestion
   */
  private mapToSuggestion(result: GeocodingResult): PlaceSuggestion {
    const address = result.address;
    let description = '';

    if (address) {
      const parts = [address.suburb, address.city, address.state].filter(Boolean);
      description = parts.join(', ');
    }

    return {
      id: result.place_id.toString(),
      name: this.getMainName(result),
      description: description || result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type,
    };
  }

  /**
   * Extract main name from result
   */
  private getMainName(result: GeocodingResult): string {
    if (result.address?.road) {
      return result.address.road;
    }
    
    if (result.address?.suburb) {
      return result.address.suburb;
    }

    if (result.address?.city) {
      return result.address.city;
    }

    // Fallback to first part of display_name
    const parts = result.display_name.split(',');
    return parts[0].trim();
  }

  /**
   * Get cached data if not expired
   */
  private getCached(key: string): any | null {
    const cached = this.requestCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      this.requestCache.delete(key);
    }
    
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }
}

export default new GeocodingService();
