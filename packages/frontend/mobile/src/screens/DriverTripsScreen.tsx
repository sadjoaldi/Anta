/**
 * Driver Trips Screen
 * Shows accepted/active/completed rides for the driver
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ridesService, { Ride, RideStatus } from '../services/rides.service';
import { useAuth } from '../hooks/useAuth';
import themeColors from '../theme/colors';

const colors = {
  primary: themeColors.primary,
  secondary: '#F5A623',
  success: '#4CAF50',
  danger: themeColors.danger,
  textLight: '#666',
};

export default function DriverTripsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

  const loadRides = React.useCallback(async () => {
    if (!user?.driver?.id) return;

    try {
      const driverId = user.driver.id;
      const allRides = await ridesService.getDriverRides(driverId, 50, 0);

      // Filter by tab
      if (selectedTab === 'active') {
        const activeRides = allRides.filter(
          (r) => r.status === RideStatus.ACCEPTED || r.status === RideStatus.STARTED
        );
        setRides(activeRides);
      } else {
        const completedRides = allRides.filter(
          (r) => r.status === RideStatus.COMPLETED || r.status === RideStatus.CANCELLED
        );
        setRides(completedRides);
      }
    } catch (error) {
      console.error('Failed to load rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.driver?.id, selectedTab]);

  // Reload rides when screen comes into focus or tab changes
  useFocusEffect(
    React.useCallback(() => {
      loadRides();
    }, [loadRides])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const getStatusBadge = (status: RideStatus) => {
    switch (status) {
      case RideStatus.ACCEPTED:
        return { text: 'Acceptée', color: colors.secondary, icon: 'checkmark-circle' };
      case RideStatus.STARTED:
        return { text: 'En cours', color: colors.primary, icon: 'car' };
      case RideStatus.COMPLETED:
        return { text: 'Terminée', color: colors.success, icon: 'checkmark-done' };
      case RideStatus.CANCELLED:
        return { text: 'Annulée', color: '#999', icon: 'close-circle' };
      default:
        return { text: status, color: '#999', icon: 'help-circle' };
    }
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} GNF`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  const renderRideItem = ({ item }: { item: Ride }) => {
    const badge = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.rideCard}
        onPress={() => {
          // TODO: Navigate to ride details
        }}
      >
        <View style={styles.rideHeader}>
          <Text style={styles.rideId}>Course #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
            <Ionicons name={badge.icon as any} size={14} color={badge.color} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <View style={styles.rideRoute}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotOrigin]} />
            <Text style={styles.routeAddress} numberOfLines={1}>
              {item.origin_address}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDestination]} />
            <Text style={styles.routeAddress} numberOfLines={1}>
              {item.dest_address}
            </Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View style={styles.rideDetail}>
            <Ionicons name="speedometer-outline" size={14} color={colors.textLight} />
            <Text style={styles.rideDetailText}>{formatDistance(item.distance)}</Text>
          </View>
          <View style={styles.rideDetail}>
            <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
            <Text style={styles.rideDetailText}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.ridePrice}>{formatPrice(item.final_price || item.estimated_price)}</Text>
        </View>
      </TouchableOpacity>
    );
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Trajets</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
            En cours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            Terminées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      {rides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={selectedTab === 'active' ? 'car-outline' : 'checkmark-done-outline'}
            size={64}
            color={colors.textLight}
          />
          <Text style={styles.emptyTitle}>
            {selectedTab === 'active' ? 'Aucune course active' : 'Aucune course terminée'}
          </Text>
          <Text style={styles.emptyText}>
            {selectedTab === 'active'
              ? 'Acceptez des demandes pour voir vos courses actives ici.'
              : 'Vos courses terminées apparaîtront ici.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
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
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  rideCard: {
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
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rideRoute: {
    marginBottom: 12,
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
  },
  routeDotOrigin: {
    backgroundColor: colors.primary,
  },
  routeDotDestination: {
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
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideDetailText: {
    fontSize: 12,
    color: '#666',
  },
  ridePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
