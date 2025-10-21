/**
 * Driver Pending Rides Screen
 * Shows pending ride requests assigned to the driver
 * Driver can accept or decline rides
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ridesService, { Ride } from '../src/services/rides.service';
import { useAuth } from '../src/hooks/useAuth';

const colors = {
  primary: '#2C64D9',
  secondary: '#F5A623',
  danger: '#FF4444',
  success: '#4CAF50',
  background: '#F8F9FA',
  text: '#1a1a1a',
  textLight: '#666',
  border: '#E0E0E0',
};

export default function DriverPendingRidesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRideId, setProcessingRideId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingRides();
    
    // Poll every 10 seconds for new rides
    const interval = setInterval(loadPendingRides, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPendingRides = async () => {
    if (!user?.driver?.id) return;
    
    try {
      const driverId = user.driver.id;
      const pendingRides = await ridesService.getDriverPendingRides(driverId);
      setRides(pendingRides);
    } catch (error) {
      console.error('Failed to load pending rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (rideId: number) => {
    Alert.alert(
      'Accepter la course',
      'Voulez-vous accepter cette course ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            if (!user?.driver?.id) return;
            
            try {
              setProcessingRideId(rideId);
              const driverId = user.driver.id;
              await ridesService.acceptRide(rideId, driverId);
              
              // Remove from list
              setRides(rides.filter(r => r.id !== rideId));
              
              Alert.alert('Succès', 'Course acceptée !', [
                {
                  text: 'Voir mes trajets',
                  onPress: () => {
                    router.push('/(tabs)/trajet');
                  },
                },
                {
                  text: 'OK',
                  style: 'cancel',
                },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'accepter la course');
            } finally {
              setProcessingRideId(null);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (rideId: number) => {
    Alert.alert(
      'Refuser la course',
      'Voulez-vous refuser cette course ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            if (!user?.driver?.id) return;
            
            try {
              setProcessingRideId(rideId);
              const driverId = user.driver.id;
              await ridesService.cancelRide(rideId, driverId, 'driver');
              
              // Remove from list
              setRides(rides.filter(r => r.id !== rideId));
              
              Alert.alert('Info', 'Course refusée');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de refuser la course');
            } finally {
              setProcessingRideId(null);
            }
          },
        },
      ]
    );
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h ${remainingMinutes} min`;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} GNF`;
  };

  const renderRideItem = ({ item }: { item: Ride }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.rideIdContainer}>
          <Text style={styles.rideIdLabel}>Course #{item.id}</Text>
          <Text style={styles.rideTime}>
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleBadgeText}>
            {item.vehicle_type === 'moto' ? '🏍️' : item.vehicle_type === 'car' ? '🚗' : '🚐'}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.routeDotOrigin]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Départ</Text>
            <Text style={styles.routeAddress}>{item.origin_address}</Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, styles.routeDotDestination]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Arrivée</Text>
            <Text style={styles.routeAddress}>{item.dest_address}</Text>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.tripDetails}>
        <View style={styles.tripDetailItem}>
          <Ionicons name="speedometer-outline" size={16} color={colors.textLight} />
          <Text style={styles.tripDetailText}>{formatDistance(item.distance)}</Text>
        </View>
        <View style={styles.tripDetailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textLight} />
          <Text style={styles.tripDetailText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.tripDetailItem}>
          <Ionicons name="people-outline" size={16} color={colors.textLight} />
          <Text style={styles.tripDetailText}>{item.passengers} pers</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Prix estimé</Text>
        <Text style={styles.priceValue}>{formatPrice(item.estimated_price)}</Text>
      </View>

      {/* Notes */}
      {item.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDecline(item.id)}
          disabled={processingRideId === item.id}
        >
          {processingRideId === item.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Refuser</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.id)}
          disabled={processingRideId === item.id}
        >
          {processingRideId === item.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Accepter</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton}>
          {/* Empty space for alignment */}
        </View>
        <Text style={styles.headerTitle}>Demandes de course</Text>
        <TouchableOpacity onPress={loadPendingRides} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {rides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Aucune demande</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas de demande de course en attente pour le moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadPendingRides();
              }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideIdContainer: {
    flex: 1,
  },
  rideIdLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rideTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  vehicleBadge: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 8,
  },
  vehicleBadgeText: {
    fontSize: 24,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeDotOrigin: {
    backgroundColor: colors.primary,
  },
  routeDotDestination: {
    backgroundColor: colors.success,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 13,
    color: colors.textLight,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 14,
  },
  declineButton: {
    backgroundColor: colors.danger,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
