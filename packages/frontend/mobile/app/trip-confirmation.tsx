/**
 * Trip Confirmation Screen
 * Displays map with route and driver selection
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouteCalculation } from '../src/hooks/useRouteCalculation';
import driverService, { Driver } from '../src/services/driver.service';
import directionsService from '../src/services/directions.service';
import colors from '../src/theme/colors';

const { height } = Dimensions.get('window');

export default function TripConfirmationScreen() {
  const params = useLocalSearchParams<{
    destinationName: string;
    destinationAddress: string;
    destinationLat: string;
    destinationLng: string;
    originLat: string;
    originLng: string;
  }>();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Parse params with useMemo to prevent recreating objects
  const origin = useMemo(() => ({
    lat: parseFloat(params.originLat as string) || 0,
    lng: parseFloat(params.originLng as string) || 0,
    name: (params.originName as string) || 'Position actuelle',
  }), [params.originLat, params.originLng, params.originName]);

  const destination = useMemo(() => ({
    name: params.destinationName || '',
    address: params.destinationAddress || '',
    lat: parseFloat(params.destinationLat) || 0,
    lng: parseFloat(params.destinationLng) || 0,
  }), [params.destinationName, params.destinationAddress, params.destinationLat, params.destinationLng]);

  // Check if coordinates are valid
  const isValidOrigin = useMemo(() => 
    origin.lat !== 0 && origin.lng !== 0 && !isNaN(origin.lat) && !isNaN(origin.lng),
    [origin.lat, origin.lng]
  );
  
  const isValidDestination = useMemo(() =>
    destination.lat !== 0 && destination.lng !== 0 && !isNaN(destination.lat) && !isNaN(destination.lng),
    [destination.lat, destination.lng]
  );

  // Route calculation
  const {
    routeInfo,
    polylineCoordinates,
    loading: routeLoading,
    calculateRoute,
  } = useRouteCalculation();

  // Calculate route on mount
  useEffect(() => {
    if (isValidOrigin && isValidDestination) {
      calculateRoute(origin, destination);
    }
  }, [isValidOrigin, isValidDestination]);

  // Load nearby drivers
  useEffect(() => {
    if (isValidOrigin) {
      loadNearbyDrivers();
    }
  }, [isValidOrigin]);

  const loadNearbyDrivers = async () => {
    try {
      setLoadingDrivers(true);
      console.log('Loading drivers near:', { lat: origin.lat, lng: origin.lng });
      const response = await driverService.getAvailableDrivers(
        origin.lat,
        origin.lng,
        50000 // 50km radius (increased from 10km)
      );
      console.log('Drivers loaded:', response.drivers.length);
      setDrivers(response.drivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Fit map to show route
  useEffect(() => {
    if (routeInfo && mapRef.current && mapReady) {
      const { northeast, southwest } = routeInfo.bounds;

      // Add a small delay to ensure map is ready
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: northeast.lat, longitude: northeast.lng },
              { latitude: southwest.lat, longitude: southwest.lng },
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
              animated: true,
            }
          );
        }
      }, 500);
    }
  }, [routeInfo, mapReady]);

  // Force map update when polyline changes
  useEffect(() => {
    if (polylineCoordinates.length > 0 && mapRef.current && mapReady) {
      // Force a subtle animation to trigger re-render
      setTimeout(() => {
        if (mapRef.current && routeInfo) {
          const { northeast, southwest } = routeInfo.bounds;
          mapRef.current.animateCamera({
            center: {
              latitude: (northeast.lat + southwest.lat) / 2,
              longitude: (northeast.lng + southwest.lng) / 2,
            },
            zoom: 13,
          }, { duration: 300 });
        }
      }, 100);
    }
  }, [polylineCoordinates.length, mapReady, routeInfo]);

  // Handle driver selection
  const handleSelectDriver = (driver: any) => {
    router.push({
      pathname: '/booking-confirmation',
      params: {
        driverId: driver.id,
        driverName: driver.user?.name || 'Chauffeur',
        driverRating: Number(driver.rating_avg || 0).toFixed(1),
        driverVehicle: `${driver.vehicle_brand} ${driver.vehicle_model}`,
        driverDistance: driver.distance ? `${(driver.distance / 1000).toFixed(1)} km` : '',
        originName: origin.name || 'Position actuelle',
        originLat: String(origin.lat),
        originLng: String(origin.lng),
        destinationName: destination.name,
        destinationAddress: destination.address,
        destinationLat: String(destination.lat),
        destinationLng: String(destination.lng),
        distance: routeInfo?.distance.text || '',
        duration: routeInfo?.duration.text || '',
        price: routeInfo?.estimatedPrice.total || 0,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: origin.lat || 9.6412,
          longitude: origin.lng || -13.5784,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        loadingEnabled
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor="#fff"
        onMapReady={() => setMapReady(true)}
        mapType="standard"
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Origin Marker */}
        {isValidOrigin && (
          <Marker
            coordinate={{
              latitude: origin.lat,
              longitude: origin.lng,
            }}
            title="Votre position"
            pinColor={colors.primary}
          />
        )}

        {/* Destination Marker */}
        {isValidDestination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title={destination.name}
            pinColor={colors.danger}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={24} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {polylineCoordinates.length > 0 && (
          <Polyline
            key={`polyline-${polylineCoordinates.length}`}
            coordinates={polylineCoordinates}
            strokeColor={colors.primary}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
            zIndex={1}
          />
        )}

        {/* Driver Markers */}
        {drivers.map((driver) => {
          if (!driver.current_latitude || !driver.current_longitude) return null;

          return (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.current_latitude,
                longitude: driver.current_longitude,
              }}
            >
              <View style={styles.driverMarker}>
                <Ionicons
                  name={driver.vehicle_type === 'Moto' ? 'bicycle' : 'car'}
                  size={16}
                  color="#fff"
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
      </TouchableOpacity>


      {/* Route Info Card */}
      {routeLoading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
        </View>
      )}

      {routeInfo && !showDrivers && (
        <View style={styles.infoCard}>
          <View style={styles.destinationInfo}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.destinationTextContainer}>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationAddress} numberOfLines={1}>
                {destination.address}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{routeInfo.distance.text}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>Durée</Text>
              <Text style={styles.detailValue}>{routeInfo.duration.text}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.detailItem}>
              <Ionicons name="cash" size={18} color="#4CAF50" />
              <Text style={styles.detailLabel}>Prix</Text>
              <Text style={styles.priceValue}>
                {directionsService.formatPrice(routeInfo.estimatedPrice.total)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.driversButton}
            onPress={() => setShowDrivers(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.driversButtonText}>
              Voir les chauffeurs ({drivers.length})
            </Text>
            <Ionicons name="chevron-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Drivers Bottom Sheet */}
      {showDrivers && (
        <View style={styles.driversSheet}>
          {/* Handle */}
          <TouchableOpacity
            style={styles.handle}
            onPress={() => setShowDrivers(false)}
          >
            <View style={styles.handleBar} />
          </TouchableOpacity>

          <Text style={styles.driversTitle}>
            🚗 {drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} disponible
            {drivers.length > 1 ? 's' : ''}
          </Text>

          <ScrollView
            style={styles.driversList}
            showsVerticalScrollIndicator={false}
          >
            {loadingDrivers ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : drivers.length === 0 ? (
              <View style={styles.emptyDrivers}>
                <Ionicons name="car-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  Aucun chauffeur disponible pour le moment
                </Text>
              </View>
            ) : (
              drivers.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  style={styles.driverCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={24} color={colors.primary} />
                  </View>

                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>
                      {driver.user?.name || 'Chauffeur'}
                    </Text>
                    <View style={styles.driverMeta}>
                      <Ionicons name="star" size={12} color="#FFC107" />
                      <Text style={styles.driverRating}>
                        {Number(driver.rating_avg || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.driverTrips}>
                        {Number(driver.total_trips || 0)} courses
                      </Text>
                    </View>
                    <Text style={styles.driverVehicle}>
                      {driver.vehicle_brand} {driver.vehicle_model}
                      {driver.vehicle_color ? ` (${driver.vehicle_color})` : ''}
                    </Text>
                  </View>

                  <View style={styles.driverActions}>
                    {driver.distance && (
                      <Text style={styles.driverDistance}>
                        {(driver.distance / 1000).toFixed(1)} km
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => handleSelectDriver(driver)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.selectButtonText}>Choisir</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  destinationTextContainer: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  destinationAddress: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  driversButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  driversButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  driversSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  driversTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  driversList: {
    flex: 1,
  },
  emptyDrivers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  driverTrips: {
    fontSize: 12,
    color: '#666',
  },
  driverVehicle: {
    fontSize: 12,
    color: '#666',
  },
  driverActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  driverDistance: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
