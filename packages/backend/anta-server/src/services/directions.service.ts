/**
 * Google Directions Service (Backend)
 * Calculates routes, distance, duration for trips
 */

import axios, { AxiosInstance } from 'axios';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

interface DirectionsLeg {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  start_location: {
    lat: number;
    lng: number;
  };
  end_location: {
    lat: number;
    lng: number;
  };
  steps: DirectionsStep[];
}

interface DirectionsStep {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  start_location: {
    lat: number;
    lng: number;
  };
  end_location: {
    lat: number;
    lng: number;
  };
  polyline: {
    points: string; // Encoded polyline
  };
  html_instructions: string;
}

interface DirectionsRoute {
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  legs: DirectionsLeg[];
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

interface DirectionsResponse {
  routes: DirectionsRoute[];
  status: string;
  error_message?: string;
}

export interface RouteInfo {
  distance: {
    text: string;
    meters: number;
    kilometers: number;
  };
  duration: {
    text: string;
    seconds: number;
    minutes: number;
  };
  polyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  estimatedPrice: {
    base: number;
    perKm: number;
    total: number;
    currency: string;
  };
}

class DirectionsService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 1800000; // 30 minutes (routes change less often)

  // Pricing configuration (Guinean Francs - GNF)
  private readonly PRICING = {
    baseFare: 5000, // Base fare: 5,000 GNF
    perKm: 2000, // Per kilometer: 2,000 GNF
    perMinute: 100, // Per minute: 100 GNF
    minimumFare: 5000, // Minimum fare: 5,000 GNF
    currency: 'GNF',
  };

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY not set, directions will fail');
    }

    this.axiosInstance = axios.create({
      baseURL: GOOGLE_MAPS_BASE_URL,
      timeout: 15000, // 15s timeout for directions
    });

    this.requestCache = new Map();
  }

  /**
   * Calculate route between two points
   */
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteInfo> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `route:${origin.lat},${origin.lng}:${destination.lat},${destination.lng}`;

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Using computeRoutes (Routes API) instead of legacy Directions API
      const response = await axios.post<any>(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng,
              },
            },
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'fr',
          units: 'METRIC',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs',
          },
          timeout: 15000,
        }
      );

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      
      // Routes API v2 format
      const distanceMeters = route.distanceMeters;
      const durationSeconds = parseInt(route.duration.replace('s', ''));

      // Calculate price
      const distanceKm = distanceMeters / 1000;
      const durationMin = durationSeconds / 60;

      const distanceCost = distanceKm * this.PRICING.perKm;
      const timeCost = durationMin * this.PRICING.perMinute;
      const totalCost = Math.max(
        this.PRICING.baseFare + distanceCost + timeCost,
        this.PRICING.minimumFare
      );

      // Format human-readable text
      const distanceText = distanceKm >= 1 
        ? `${distanceKm.toFixed(1)} km` 
        : `${distanceMeters} m`;
      const durationText = durationMin >= 60
        ? `${Math.floor(durationMin / 60)} h ${Math.ceil(durationMin % 60)} min`
        : `${Math.ceil(durationMin)} min`;

      // Calculate bounds from viewport if available, otherwise from legs
      let bounds = {
        northeast: { lat: 0, lng: 0 },
        southwest: { lat: 0, lng: 0 },
      };

      if (route.viewport) {
        // Routes API v2 has viewport
        bounds = {
          northeast: {
            lat: route.viewport.high.latitude,
            lng: route.viewport.high.longitude,
          },
          southwest: {
            lat: route.viewport.low.latitude,
            lng: route.viewport.low.longitude,
          },
        };
      } else if (route.legs && route.legs.length > 0) {
        // Calculate from legs
        const firstLeg = route.legs[0];
        const lastLeg = route.legs[route.legs.length - 1];
        
        bounds = {
          northeast: {
            lat: Math.max(firstLeg.startLocation.latLng.latitude, lastLeg.endLocation.latLng.latitude),
            lng: Math.max(firstLeg.startLocation.latLng.longitude, lastLeg.endLocation.latLng.longitude),
          },
          southwest: {
            lat: Math.min(firstLeg.startLocation.latLng.latitude, lastLeg.endLocation.latLng.latitude),
            lng: Math.min(firstLeg.startLocation.latLng.longitude, lastLeg.endLocation.latLng.longitude),
          },
        };
      }

      const routeInfo: RouteInfo = {
        distance: {
          text: distanceText,
          meters: distanceMeters,
          kilometers: parseFloat(distanceKm.toFixed(2)),
        },
        duration: {
          text: durationText,
          seconds: durationSeconds,
          minutes: Math.ceil(durationMin),
        },
        polyline: route.polyline.encodedPolyline,
        bounds,
        estimatedPrice: {
          base: this.PRICING.baseFare,
          perKm: this.PRICING.perKm,
          total: Math.round(totalCost),
          currency: this.PRICING.currency,
        },
      };

      // Cache result
      this.setCache(cacheKey, routeInfo);

      return routeInfo;
    } catch (error: any) {
      console.error('Directions API error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error('Failed to calculate route');
    }
  }

  /**
   * Update pricing configuration
   */
  updatePricing(pricing: Partial<typeof DirectionsService.prototype.PRICING>) {
    Object.assign(this.PRICING, pricing);
  }

  /**
   * Get current pricing configuration
   */
  getPricing() {
    return { ...this.PRICING };
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

export default new DirectionsService();
