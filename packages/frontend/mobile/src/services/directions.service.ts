/**
 * Directions Service (Frontend)
 * Calculates routes and estimates prices
 */

import apiClient from './api.client';

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

export interface Pricing {
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
  currency: string;
}

class DirectionsService {
  /**
   * Calculate route between origin and destination
   */
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteInfo> {
    const response = await apiClient.get<RouteInfo>('/directions/route', {
      params: {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
      },
    });

    return response;
  }

  /**
   * Get current pricing configuration
   */
  async getPricing(): Promise<Pricing> {
    const response = await apiClient.get<Pricing>('/directions/pricing');
    return response;
  }

  /**
   * Decode polyline to array of coordinates
   * Based on Google's polyline encoding algorithm
   */
  decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Format price with currency
   */
  formatPrice(amount: number, currency: string = 'GNF'): string {
    if (currency === 'GNF') {
      return `${amount.toLocaleString('fr-GN')} GNF`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export default new DirectionsService();
