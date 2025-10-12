/**
 * Hook for route calculation
 * Manages route fetching, polyline decoding, and price estimation
 */

import { useState, useCallback } from 'react';
import directionsService, { RouteInfo } from '../services/directions.service';

interface UseRouteCalculationResult {
  routeInfo: RouteInfo | null;
  polylineCoordinates: Array<{ latitude: number; longitude: number }>;
  loading: boolean;
  error: string | null;
  calculateRoute: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => Promise<void>;
  clearRoute: () => void;
}

export const useRouteCalculation = (): UseRouteCalculationResult => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [polylineCoordinates, setPolylineCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(
    async (
      origin: { lat: number; lng: number },
      destination: { lat: number; lng: number }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const route = await directionsService.getRoute(origin, destination);
        setRouteInfo(route);

        // Decode polyline
        const coordinates = directionsService.decodePolyline(route.polyline);
        setPolylineCoordinates(coordinates);

        console.log('Route calculated:', {
          distance: route.distance.text,
          duration: route.duration.text,
          price: route.estimatedPrice.total,
          points: coordinates.length,
        });
      } catch (err: any) {
        console.error('Route calculation error:', err);
        setError(err.message || 'Impossible de calculer l\'itinéraire');
        setRouteInfo(null);
        setPolylineCoordinates([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearRoute = useCallback(() => {
    setRouteInfo(null);
    setPolylineCoordinates([]);
    setError(null);
  }, []);

  return {
    routeInfo,
    polylineCoordinates,
    loading,
    error,
    calculateRoute,
    clearRoute,
  };
};
