/**
 * Location Service
 * Manages real-time location tracking for drivers and passengers
 */

import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private onLocationUpdate: ((location: LocationCoordinates) => void) | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Request background location permissions (for drivers)
   */
  async requestBackgroundPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting background location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start watching location (real-time updates)
   */
  async startWatchingLocation(
    callback: (location: LocationCoordinates) => void,
    options: {
      accuracy?: Location.Accuracy;
      distanceInterval?: number;
      timeInterval?: number;
    } = {}
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      this.onLocationUpdate = callback;

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.High,
          distanceInterval: options.distanceInterval || 50, // meters
          timeInterval: options.timeInterval || 10000, // 10 seconds
        },
        (location) => {
          const coords: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          };

          if (this.onLocationUpdate) {
            this.onLocationUpdate(coords);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error watching location:', error);
      return false;
    }
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.onLocationUpdate = null;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    from: LocationCoordinates,
    to: LocationCoordinates
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate bearing between two coordinates (direction)
   */
  calculateBearing(
    from: LocationCoordinates,
    to: LocationCoordinates
  ): number {
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
  }

  /**
   * Calculate ETA based on distance and average speed
   */
  calculateETA(
    distanceMeters: number,
    speedMps?: number
  ): number {
    // Default speed: 30 km/h in urban areas
    const avgSpeed = speedMps || (30 * 1000) / 3600; // m/s
    return Math.ceil(distanceMeters / avgSpeed / 60); // minutes
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format ETA for display
   */
  formatETA(minutes: number): string {
    if (minutes < 1) {
      return "< 1 min";
    }
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}

export default new LocationService();
