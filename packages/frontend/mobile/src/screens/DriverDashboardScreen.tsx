/**
 * Driver Dashboard Screen
 * Main home screen for drivers with stats and pending requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ridesService, { Ride, RideStatus } from '../services/rides.service';
import { useAuth } from '../hooks/useAuth';
import themeColors from '../theme/colors';
import locationService from '../services/location.service';
import { Switch } from 'react-native';
import driverProfileService from '../services/driverProfile.service';

const colors = {
  primary: themeColors.primary,
  secondary: '#F5A623',
  success: '#4CAF50',
  danger: themeColors.danger,
  textLight: '#666',
};

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayRides: 0,
    totalRides: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRideId, setProcessingRideId] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  // Vérifier le profil au chargement
  useEffect(() => {
    checkDriverProfile();
  }, []);

  const checkDriverProfile = async () => {
    if (!user?.id) return;

    try {
      const status = await driverProfileService.checkProfileStatus(user.id);
      
      // Si les documents ne sont pas complets ou si le KYC est rejeté, rediriger
      if (!status.hasAllDocuments || status.kycStatus === 'rejected') {
        router.replace('/driver/complete-profile');
        return;
      }
      
      setProfileChecked(true);
    } catch (error: any) {
      // En cas d'erreur (ex: driver n'existe pas), rediriger vers la page de complétion
      router.replace('/driver/complete-profile');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (profileChecked) {
        loadDashboardData();
        
        // Poll dashboard data every 15 seconds when online
        const interval = setInterval(() => {
          if (isOnline) {
            loadDashboardData();
          }
        }, 15000);
        
        return () => clearInterval(interval);
      }
    }, [isOnline, profileChecked])
  );

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      if (isOnline) {
        locationService.stopWatchingLocation();
      }
    };
  }, [isOnline]);

  const toggleOnlineStatus = async () => {
    if (!isOnline) {
      // Go online
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission requise',
          'La localisation est nécessaire pour recevoir des courses.'
        );
        return;
      }

      // Start tracking location
      const started = await locationService.startWatchingLocation(
        async (location) => {
          setCurrentLocation({ lat: location.latitude, lng: location.longitude });
          
          // TODO: Send location to backend
          // await driverService.updateLocation(user.driver.id, location);
        },
        {
          distanceInterval: 50,
          timeInterval: 10000,
        }
      );

      if (started) {
        setIsOnline(true);
        Alert.alert('En ligne', 'Vous pouvez maintenant recevoir des demandes de course.');
      }
    } else {
      // Go offline
      locationService.stopWatchingLocation();
      setIsOnline(false);
      setCurrentLocation(null);
      Alert.alert('Hors ligne', 'Vous ne recevrez plus de demandes de course.');
    }
  };

  const loadDashboardData = async () => {
    if (!user?.driver?.id) return;

    try {
      const driverId = user.driver.id;

      // Load pending rides
      const pending = await ridesService.getDriverPendingRides(driverId);
      setPendingRides(pending);

      // Load all rides to calculate stats
      const allRides = await ridesService.getDriverRides(driverId, 100, 0);

      // Filter active rides
      const active = allRides.filter(
        (r) => r.status === RideStatus.ACCEPTED || r.status === RideStatus.STARTED
      );
      setActiveRides(active);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRides = allRides.filter((r) => {
        const rideDate = new Date(r.created_at);
        rideDate.setHours(0, 0, 0, 0);
        return rideDate.getTime() === today.getTime() && r.status === RideStatus.COMPLETED;
      });

      const todayEarnings = todayRides.reduce((sum, r) => sum + (r.final_price || r.estimated_price), 0);
      const completedRides = allRides.filter((r) => r.status === RideStatus.COMPLETED);

      setStats({
        todayEarnings,
        todayRides: todayRides.length,
        totalRides: completedRides.length,
        rating: 4.8, // TODO: Get from driver profile
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRide = async (rideId: number) => {
    if (!user?.driver?.id) return;

    Alert.alert('Accepter la course', 'Voulez-vous accepter cette course ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Accepter',
        onPress: async () => {
          try {
            setProcessingRideId(rideId);
            const driverId = user.driver!.id;
            await ridesService.acceptRide(rideId, driverId);

            // Remove from pending list
            setPendingRides(pendingRides.filter((r) => r.id !== rideId));

            Alert.alert('Succès', 'Course acceptée !', [
              {
                text: 'Voir mes trajets',
                onPress: () => router.push('/(tabs)/trajet'),
              },
              { text: 'OK', style: 'cancel' },
            ]);
          } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible d'accepter la course");
          } finally {
            setProcessingRideId(null);
          }
        },
      },
    ]);
  };

  const handleDeclineRide = async (rideId: number) => {
    if (!user?.driver?.id) return;

    Alert.alert('Refuser la course', 'Voulez-vous refuser cette course ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingRideId(rideId);
            const driverId = user.driver!.id;
            await ridesService.cancelRide(rideId, driverId, 'driver');

            setPendingRides(pendingRides.filter((r) => r.id !== rideId));
            Alert.alert('Info', 'Course refusée');
          } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de refuser la course');
          } finally {
            setProcessingRideId(null);
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} GNF`;

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboardData(); }} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.driverName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#1a1a1a" />
          {pendingRides.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {/* Online Status Toggle */}
      <View style={styles.statusToggleCard}>
        <View style={styles.statusInfo}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
          {currentLocation && isOnline && (
            <Text style={styles.locationText}>
              📍 Position mise à jour
            </Text>
          )}
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#ccc', true: colors.primary }}
          thumbColor={isOnline ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Ionicons name="cash-outline" size={28} color="#fff" />
          <Text style={styles.statValue}>{formatPrice(stats.todayEarnings)}</Text>
          <Text style={styles.statLabel}>Gains aujourd'hui</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCardSmall}>
            <Ionicons name="car-outline" size={20} color={colors.primary} />
            <Text style={styles.statValueSmall}>{stats.todayRides}</Text>
            <Text style={styles.statLabelSmall}>Courses</Text>
          </View>
          <View style={styles.statCardSmall}>
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text style={styles.statValueSmall}>{stats.rating}</Text>
            <Text style={styles.statLabelSmall}>Note</Text>
          </View>
        </View>
      </View>

      {/* Active Rides */}
      {activeRides.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Courses en cours</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trajet')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {activeRides.slice(0, 2).map((ride) => (
            <TouchableOpacity key={ride.id} style={styles.activeRideCard}>
              <View style={styles.activeRideHeader}>
                <Text style={styles.activeRideId}>Course #{ride.id}</Text>
                <View style={[styles.badge, ride.status === RideStatus.STARTED ? styles.badgeStarted : styles.badgeAccepted]}>
                  <Text style={styles.badgeText}>
                    {ride.status === RideStatus.STARTED ? 'En cours' : 'Acceptée'}
                  </Text>
                </View>
              </View>
              <Text style={styles.activeRideRoute} numberOfLines={1}>
                {ride.origin_address} → {ride.dest_address}
              </Text>
              <Text style={styles.activeRidePrice}>{formatPrice(ride.estimated_price)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pending Rides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Nouvelles demandes {pendingRides.length > 0 && `(${pendingRides.length})`}
        </Text>

        {pendingRides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
            <Text style={styles.emptyTitle}>Tout est à jour !</Text>
            <Text style={styles.emptyText}>Vous n'avez pas de nouvelle demande pour le moment.</Text>
          </View>
        ) : (
          pendingRides.map((ride) => (
            <View key={ride.id} style={styles.pendingRideCard}>
              <View style={styles.pendingRideHeader}>
                <Text style={styles.pendingRideId}>Course #{ride.id}</Text>
                <View style={styles.vehicleBadge}>
                  <Text style={styles.vehicleBadgeText}>
                    {ride.vehicle_type === 'moto' ? '🏍️' : ride.vehicle_type === 'car' ? '🚗' : '🚐'}
                  </Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotOrigin]} />
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

              <View style={styles.pendingRideDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="speedometer-outline" size={14} color={colors.textLight} />
                  <Text style={styles.detailText}>{formatDistance(ride.distance)}</Text>
                </View>
                <Text style={styles.pendingRidePrice}>{formatPrice(ride.estimated_price)}</Text>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDeclineRide(ride.id)}
                  disabled={processingRideId === ride.id}
                >
                  {processingRideId === ride.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Refuser</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRide(ride.id)}
                  disabled={processingRideId === ride.id}
                >
                  {processingRideId === ride.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Accepter</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  statusToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: colors.success,
  },
  statusOffline: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: colors.primary,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabelSmall: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  activeRideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  activeRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeRideId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeAccepted: {
    backgroundColor: colors.secondary + '20',
  },
  badgeStarted: {
    backgroundColor: colors.primary + '20',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  activeRideRoute: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  activeRidePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  pendingRideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingRideId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  vehicleBadge: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 6,
  },
  vehicleBadgeText: {
    fontSize: 20,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeDotOrigin: {
    backgroundColor: colors.primary,
  },
  routeDotDest: {
    backgroundColor: colors.success,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginLeft: 3,
    marginVertical: 4,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  pendingRideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  pendingRidePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
  },
  declineButton: {
    backgroundColor: '#ddd',
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
