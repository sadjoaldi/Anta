/**
 * New Home Screen (Refactored UX)
 * Simple search-first interface without map clutter
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AddressSearchModal from '../../src/components/AddressSearchModal';
import FavoritePlaces from '../../src/components/FavoritePlaces';
import PromotedPlaces, { PromotedPlace } from '../../src/components/PromotedPlaces';
import RecentDestinations from '../../src/components/RecentDestinations';
import SearchHomeInput from '../../src/components/SearchHomeInput';
import { useAddressSearch } from '../../src/hooks/useAddressSearch';
import { PlaceSuggestion } from '../../src/services/geocoding.service';
import placesService from '../../src/services/places.service';
import colors from '../../src/theme/colors';
import { FavoritePlace, RecentDestination } from '../../src/types/places.types';
import { useAuth } from '../../src/hooks/useAuth';
import DriverDashboardScreen from '../../src/screens/DriverDashboardScreen';

export default function NewHomeScreen() {
  const { user } = useAuth();

  // If user is a driver, show driver interface
  if (user?.role === 'driver') {
    return <DriverDashboardScreen />;
  }

  // Otherwise, show passenger interface
  return <PassengerHomeScreen />;
}

function PassengerHomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<RecentDestination[]>([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchingOrigin, setSearchingOrigin] = useState(false); // true = origin, false = destination
  const [editingFavorite, setEditingFavorite] = useState<FavoritePlace | null>(null);
  const [customOrigin, setCustomOrigin] = useState<PlaceSuggestion | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<PlaceSuggestion | null>(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Mock promoted places (will be replaced by API call later)
  const [promotedPlaces] = useState<PromotedPlace[]>([
    {
      id: '1',
      name: 'Restaurant Le Damier',
      category: '🍽️ Restaurant',
      rating: 4.5,
      distance: '2.3 km',
      description: 'Cuisine locale et internationale',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    },
    {
      id: '2',
      name: 'Marché Niger',
      category: '🛒 Shopping',
      rating: 4.2,
      distance: '1.5 km',
      description: 'Marché traditionnel avec produits locaux',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    },
    {
      id: '3',
      name: 'Mosquée Fayçal',
      category: '🕌 Monument',
      rating: 4.8,
      distance: '3.0 km',
      description: 'Monument historique à visiter',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400',
    },
    {
      id: '4',
      name: 'Plage de Rogbané',
      category: '🏖️ Loisirs',
      rating: 4.6,
      distance: '5.2 km',
      description: 'Belle plage pour se détendre',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
  ]);

  // Address search hook
  const {
    query,
    suggestions,
    loading: searchLoading,
    handleQueryChange,
    clearSearch,
  } = useAddressSearch({
    userLocation: location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : undefined,
  });

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'ANTA a besoin d\'accéder à votre position pour fonctionner.'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Load favorites and recent destinations on mount
  useEffect(() => {
    loadFavorites();
    loadRecentDestinations();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Reload data when screen comes into focus (after navigation back)
  useFocusEffect(
    useCallback(() => {
      loadRecentDestinations();
    }, [])
  );

  const loadFavorites = async () => {
    const favs = await placesService.getFavorites();
    setFavorites(favs);
  };

  const loadRecentDestinations = async () => {
    const recent = await placesService.getRecentDestinations();
    setRecentDestinations(recent);
  };

  // Handle place selection
  const handleSelectPlace = useCallback(
    async (place: PlaceSuggestion) => {
      // If searching for origin
      if (searchingOrigin) {
        setCustomOrigin(place);
        setSearchModalVisible(false);
        setSearchingOrigin(false);
        clearSearch();
        return;
      }

      // If searching for destination
      setSelectedDestination(place);

      // Add to recent destinations
      await placesService.addRecentDestination({
        name: place.name,
        address: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
      });

      // Reload recent destinations to show the new one
      await loadRecentDestinations();

      // Close modal
      setSearchModalVisible(false);
      setSearchingOrigin(false);
      clearSearch();

      // Get origin (custom or current location with Guinea bounds check)
      const DEFAULT_CONAKRY_LAT = 9.6412;
      const DEFAULT_CONAKRY_LNG = -13.5784;

      let originLat: number;
      let originLng: number;

      if (customOrigin) {
        originLat = customOrigin.latitude;
        originLng = customOrigin.longitude;
      } else if (location) {
        // Check if in Guinea
        const isInGuinea =
          location.coords.latitude >= 7.0 &&
          location.coords.latitude <= 12.7 &&
          location.coords.longitude >= -15.1 &&
          location.coords.longitude <= -7.6;

        if (isInGuinea) {
          originLat = location.coords.latitude;
          originLng = location.coords.longitude;
        } else {
          originLat = DEFAULT_CONAKRY_LAT;
          originLng = DEFAULT_CONAKRY_LNG;
        }
      } else {
        originLat = DEFAULT_CONAKRY_LAT;
        originLng = DEFAULT_CONAKRY_LNG;
      }

      // Navigate to trip confirmation screen with place data
      router.push({
        pathname: '/trip-confirmation',
        params: {
          destinationName: place.name,
          destinationAddress: place.description,
          destinationLat: String(place.latitude),
          destinationLng: String(place.longitude),
          originName: customOrigin?.name || 'Position actuelle',
          originLat: String(originLat),
          originLng: String(originLng),
        },
      });
    },
    [location, clearSearch, searchingOrigin, customOrigin]
  );

  // Handle favorite selection
  const handleSelectFavorite = (favorite: FavoritePlace) => {
    if (!favorite.latitude || !favorite.longitude) {
      Alert.alert(
        'Favori non configuré',
        'Veuillez d\'abord configurer cette destination favorite.'
      );
      return;
    }

    // Get origin with Guinea bounds check
    const DEFAULT_CONAKRY_LAT = 9.6412;
    const DEFAULT_CONAKRY_LNG = -13.5784;

    let originLat: number;
    let originLng: number;

    if (customOrigin) {
      originLat = customOrigin.latitude;
      originLng = customOrigin.longitude;
    } else if (location) {
      const isInGuinea =
        location.coords.latitude >= 7.0 &&
        location.coords.latitude <= 12.7 &&
        location.coords.longitude >= -15.1 &&
        location.coords.longitude <= -7.6;

      if (isInGuinea) {
        originLat = location.coords.latitude;
        originLng = location.coords.longitude;
      } else {
        originLat = DEFAULT_CONAKRY_LAT;
        originLng = DEFAULT_CONAKRY_LNG;
      }
    } else {
      originLat = DEFAULT_CONAKRY_LAT;
      originLng = DEFAULT_CONAKRY_LNG;
    }

    // Navigate to trip confirmation screen
    router.push({
      pathname: '/trip-confirmation',
      params: {
        destinationName: favorite.name,
        destinationAddress: favorite.address || favorite.name,
        destinationLat: String(favorite.latitude),
        destinationLng: String(favorite.longitude),
        originName: customOrigin?.name || 'Position actuelle',
        originLat: String(originLat),
        originLng: String(originLng),
      },
    });
  };

  // Handle recent destination selection
  const handleSelectRecent = (destination: RecentDestination) => {
    // Validate coordinates
    if (!destination.latitude || !destination.longitude) {
      Alert.alert(
        'Coordonnées invalides',
        'Cette destination n\'a pas de coordonnées valides.'
      );
      return;
    }

    // Default origin: Conakry, Guinée (if no custom origin or if GPS is outside Guinea)
    const DEFAULT_CONAKRY_LAT = 9.6412;
    const DEFAULT_CONAKRY_LNG = -13.5784;

    let originLat: number;
    let originLng: number;

    if (customOrigin) {
      // Use custom origin if set
      originLat = customOrigin.latitude;
      originLng = customOrigin.longitude;
    } else if (location) {
      // Check if current GPS location is in Guinea (rough bounds check)
      const isInGuinea =
        location.coords.latitude >= 7.0 &&
        location.coords.latitude <= 12.7 &&
        location.coords.longitude >= -15.1 &&
        location.coords.longitude <= -7.6;

      if (isInGuinea) {
        originLat = location.coords.latitude;
        originLng = location.coords.longitude;
      } else {
        // User is outside Guinea, use default Conakry location
        originLat = DEFAULT_CONAKRY_LAT;
        originLng = DEFAULT_CONAKRY_LNG;
      }
    } else {
      // No GPS available, use default
      originLat = DEFAULT_CONAKRY_LAT;
      originLng = DEFAULT_CONAKRY_LNG;
    }

    // Navigate to trip confirmation screen
    router.push({
      pathname: '/trip-confirmation',
      params: {
        destinationName: destination.name,
        destinationAddress: destination.address,
        destinationLat: String(destination.latitude),
        destinationLng: String(destination.longitude),
        originName: customOrigin?.name || 'Position actuelle',
        originLat: String(originLat),
        originLng: String(originLng),
      },
    });
  };

  // Handle edit favorite
  const handleEditFavorite = (favorite: FavoritePlace) => {
    setEditingFavorite(favorite);
    setSearchModalVisible(true);
  };

  // Handle delete recent
  const handleDeleteRecent = async (id: string) => {
    await placesService.removeRecentDestination(id);
    loadRecentDestinations();
  };

  // Handle clear all recent
  const handleClearAllRecent = async () => {
    await placesService.clearRecentDestinations();
    loadRecentDestinations();
  };

  // Handle promoted place selection
  const handleSelectPromoted = (place: PromotedPlace) => {
    Alert.alert(
      place.name,
      `${place.category}\n\n${place.description || ''}\n\nVoulez-vous y aller ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Itinéraire',
          onPress: () => {
            // For now, show info. In production, this would navigate to the place
            Alert.alert(
              'Fonctionnalité à venir',
              'L\'itinéraire vers les lieux promus sera disponible prochainement.'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🚗 ANTA</Text>
        </View>
        <Text style={styles.greeting}>
          Bonjour, où souhaitez-vous aller ?
        </Text>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.inputGroup, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.inputLabel}>📍 D'où partez-vous ?</Text>
          <SearchHomeInput
            onPress={() => {
              setSearchingOrigin(true);
              setSearchModalVisible(true);
            }}
            placeholder={
              customOrigin
                ? customOrigin.name
                : '📍 Ma position actuelle'
            }
          />
          {customOrigin && (
            <TouchableOpacity
              style={styles.clearOriginButton}
              onPress={() => setCustomOrigin(null)}
            >
              <Text style={styles.clearOriginText}>
                ✕ Utiliser ma position actuelle
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Destination Input */}
        <Animated.View style={[styles.inputGroup, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.inputLabel}>🔍 Où allez-vous ?</Text>
          <SearchHomeInput
            onPress={() => {
              setSearchingOrigin(false);
              setSearchModalVisible(true);
            }}
            placeholder={
              selectedDestination
                ? selectedDestination.name
                : 'Destination'
            }
          />
          {selectedDestination && (
            <TouchableOpacity
              style={styles.clearOriginButton}
              onPress={() => setSelectedDestination(null)}
            >
              <Text style={styles.clearOriginText}>
                ✕ Effacer la destination
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Favorite Places */}
        <FavoritePlaces
          favorites={favorites}
          onSelectFavorite={handleSelectFavorite}
          onEditFavorite={handleEditFavorite}
        />

        {/* Recent Destinations */}
        <RecentDestinations
          destinations={recentDestinations}
          onSelectDestination={handleSelectRecent}
          onDeleteDestination={handleDeleteRecent}
          onClearAll={handleClearAllRecent}
        />

        {/* Promoted Places (Advertising) */}
        <PromotedPlaces
          places={promotedPlaces}
          onSelectPlace={handleSelectPromoted}
        />

        {/* Empty state */}
        {recentDestinations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              Recherchez une destination pour commencer
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Search Modal */}
      <AddressSearchModal
        visible={searchModalVisible}
        onClose={() => {
          setSearchModalVisible(false);
          setSearchingOrigin(false);
          setEditingFavorite(null);
          clearSearch();
        }}
        query={query}
        onQueryChange={handleQueryChange}
        suggestions={suggestions}
        loading={searchLoading}
        onSelectPlace={async (place) => {
          if (editingFavorite) {
            // Save as favorite
            await placesService.saveFavorite({
              id: editingFavorite.id,
              name: editingFavorite.name,
              icon: editingFavorite.icon,
              address: place.description,
              latitude: place.latitude,
              longitude: place.longitude,
            });
            setEditingFavorite(null);
            setSearchModalVisible(false);
            clearSearch();
            loadFavorites();
          } else {
            handleSelectPlace(place);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  clearOriginButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearOriginText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
