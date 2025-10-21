/**
 * Active Ride Tracker Component
 * Displays ongoing ride with real-time driver location and ETA
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ride, RideStatus } from '../services/rides.service';
import colors from '../theme/colors';

interface ActiveRideTrackerProps {
  ride: Ride;
  onViewDetails: () => void;
  onCancel: () => void;
}

export default function ActiveRideTracker({
  ride,
  onViewDetails,
  onCancel,
}: ActiveRideTrackerProps) {
  const [driverLocation, setDriverLocation] = useState({
    latitude: ride.origin_lat || 9.6412,
    longitude: ride.origin_lng || -13.5784,
  });
  const [eta, setEta] = useState(5); // minutes
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Simulate driver location updates (replace with real WebSocket/polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Replace with actual driver location from backend
      // For now, simulate movement toward destination
      setDriverLocation((prev) => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));

      // Update ETA
      setEta((prev) => Math.max(0, prev - 0.5));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Pulse animation for driver marker
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleShareTrip = async () => {
    const message = `🚗 Je suis en course ANTA\n\n` +
      `Chauffeur: ${ride.driver_name}\n` +
      `Tél: ${ride.driver_phone}\n` +
      `De: ${ride.origin_address}\n` +
      `À: ${ride.dest_address}\n\n` +
      `Je te préviendrai quand j'arrive ! 🙏`;

    try {
      await Share.share({
        message,
        title: 'Ma course ANTA',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCallDriver = () => {
    if (ride.driver_phone) {
      Linking.openURL(`tel:${ride.driver_phone}`);
    }
  };

  const getStatusInfo = () => {
    switch (ride.status) {
      case RideStatus.PENDING:
        return {
          icon: 'time',
          color: '#F5A623',
          text: 'En attente d\'acceptation',
          description: 'Le chauffeur va accepter bientôt...',
        };
      case RideStatus.ACCEPTED:
        return {
          icon: 'car',
          color: colors.primary,
          text: 'Chauffeur en route',
          description: `Arrivée dans ${Math.ceil(eta)} min`,
        };
      case RideStatus.STARTED:
        return {
          icon: 'navigate',
          color: colors.success,
          text: 'Course en cours',
          description: 'Direction votre destination',
        };
      default:
        return {
          icon: 'checkmark-circle',
          color: colors.success,
          text: 'Course terminée',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Driver Marker */}
        <Marker coordinate={driverLocation}>
          <Animated.View
            style={[
              styles.driverMarker,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name="car" size={20} color="#fff" />
          </Animated.View>
        </Marker>

        {/* Destination Marker */}
        {ride.status === RideStatus.STARTED && (
          <Marker
            coordinate={{
              latitude: ride.dest_lat,
              longitude: ride.dest_lng,
            }}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Origin Marker (for accepted status) */}
        {ride.status === RideStatus.ACCEPTED && (
          <Marker
            coordinate={{
              latitude: ride.origin_lat,
              longitude: ride.origin_lng,
            }}
          >
            <View style={styles.originMarker}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: statusInfo.color }]}>
        <Ionicons name={statusInfo.icon as any} size={24} color="#fff" />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
          {statusInfo.description && (
            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
          )}
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{ride.driver_name}</Text>
            <Text style={styles.vehicleInfo}>
              {ride.vehicle_type === 'moto' ? '🏍️' : '🚗'} Plaque: {/* TODO: Add vehicle plate */}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallDriver}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareTrip}
          >
            <Ionicons name="share-social" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, styles.shareButtonText]}>
              Partager
            </Text>
          </TouchableOpacity>
        </View>

        {/* Route Info */}
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <Text style={styles.routeAddress} numberOfLines={1}>
              {ride.origin_address}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDest]} />
            <Text style={styles.routeAddress} numberOfLines={1}>
              {ride.dest_address}
            </Text>
          </View>
        </View>

        {/* Details & Cancel */}
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.detailsLink}>Voir les détails</Text>
          </TouchableOpacity>
          {ride.status !== RideStatus.STARTED && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelLink}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: 200,
  },
  driverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
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
  },
  originMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statusDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  infoCard: {
    padding: 16,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#666',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  shareButtonText: {
    color: colors.primary,
  },
  routeInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeDotDest: {
    backgroundColor: colors.danger,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 3,
    marginVertical: 6,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  cancelLink: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
});
