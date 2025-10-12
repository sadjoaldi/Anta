/**
 * Google Places Geocoding Service (Backend)
 * Better results for Guinea addresses
 */

import axios, { AxiosInstance } from 'axios';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

interface GooglePlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleGeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
}

interface PlaceSuggestion {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
}

class GoogleGeocodingService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY not set, geocoding will fail');
    }

    this.axiosInstance = axios.create({
      baseURL: GOOGLE_MAPS_BASE_URL,
      timeout: 10000,
    });

    this.requestCache = new Map();
  }

  /**
   * Search for places in Guinea using Autocomplete
   */
  async searchPlaces(query: string, limit: number = 10): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `search:${query}:${limit}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Step 1: Get autocomplete predictions
      const autocompleteResponse = await this.axiosInstance.get<{
        predictions: GooglePlaceResult[];
        status: string;
      }>('/place/autocomplete/json', {
        params: {
          input: query,
          key: this.apiKey,
          components: 'country:gn', // Restrict to Guinea
          language: 'fr',
        },
      });

      if (autocompleteResponse.data.status !== 'OK' && autocompleteResponse.data.status !== 'ZERO_RESULTS') {
        console.error('Google Places Autocomplete error:', autocompleteResponse.data.status);
        return [];
      }

      const predictions = autocompleteResponse.data.predictions || [];
      const limitedPredictions = predictions.slice(0, limit);

      // Step 2: Get details (including coordinates) for each prediction
      const placesPromises = limitedPredictions.map(prediction =>
        this.getPlaceDetails(prediction.place_id)
      );

      const places = await Promise.all(placesPromises);
      const validPlaces = places.filter((p): p is PlaceSuggestion => p !== null);

      // Cache results
      this.setCache(cacheKey, validPlaces);
      
      return validPlaces;
    } catch (error: any) {
      console.error('Google Places search error:', error.message);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Get place details including coordinates
   */
  private async getPlaceDetails(placeId: string): Promise<PlaceSuggestion | null> {
    try {
      const response = await this.axiosInstance.get<{
        result: GoogleGeocodingResult;
        status: string;
      }>('/place/details/json', {
        params: {
          place_id: placeId,
          fields: 'place_id,formatted_address,geometry,address_components,types',
          key: this.apiKey,
          language: 'fr',
        },
      });

      if (response.data.status !== 'OK') {
        return null;
      }

      const result = response.data.result;

      return {
        id: result.place_id,
        name: this.extractMainName(result),
        description: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        type: result.types[0] || 'unknown',
      };
    } catch (error) {
      console.error('Failed to get place details:', placeId);
      return null;
    }
  }

  /**
   * Search places near a location (using autocomplete with bias)
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

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `nearby:${query}:${latitude}:${longitude}:${limit}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Autocomplete with location bias
      const autocompleteResponse = await this.axiosInstance.get<{
        predictions: GooglePlaceResult[];
        status: string;
      }>('/place/autocomplete/json', {
        params: {
          input: query,
          key: this.apiKey,
          components: 'country:gn',
          language: 'fr',
          location: `${latitude},${longitude}`,
          radius: 50000, // 50km radius
        },
      });

      if (autocompleteResponse.data.status !== 'OK' && autocompleteResponse.data.status !== 'ZERO_RESULTS') {
        console.error('Google Places Nearby error:', autocompleteResponse.data.status);
        return [];
      }

      const predictions = autocompleteResponse.data.predictions || [];
      const limitedPredictions = predictions.slice(0, limit);

      const placesPromises = limitedPredictions.map(prediction =>
        this.getPlaceDetails(prediction.place_id)
      );

      const places = await Promise.all(placesPromises);
      const validPlaces = places.filter((p): p is PlaceSuggestion => p !== null);

      // Cache results
      this.setCache(cacheKey, validPlaces);
      
      return validPlaces;
    } catch (error: any) {
      console.error('Nearby search error:', error.message);
      throw new Error('Failed to search nearby places');
    }
  }

  /**
   * Reverse geocoding: Get address from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `reverse:${latitude}:${longitude}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<{
        results: GoogleGeocodingResult[];
        status: string;
      }>('/geocode/json', {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
          language: 'fr',
        },
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        return null;
      }

      const address = response.data.results[0].formatted_address;
      
      // Cache result
      this.setCache(cacheKey, address);
      
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Extract main name from Google result
   */
  private extractMainName(result: GoogleGeocodingResult): string {
    // Try to get the most specific name
    const components = result.address_components;

    // Priority order: point_of_interest > route > neighborhood > locality
    const pointOfInterest = components.find(c => c.types.includes('point_of_interest'));
    if (pointOfInterest) return pointOfInterest.long_name;

    const route = components.find(c => c.types.includes('route'));
    if (route) return route.long_name;

    const neighborhood = components.find(c => c.types.includes('neighborhood'));
    if (neighborhood) return neighborhood.long_name;

    const locality = components.find(c => c.types.includes('locality'));
    if (locality) return locality.long_name;

    // Fallback to formatted address first part
    const parts = result.formatted_address.split(',');
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

export default new GoogleGeocodingService();
