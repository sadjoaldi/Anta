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
import RecentDestinations from '../../src/components/RecentDestinations';
import SearchHomeInput from '../../src/components/SearchHomeInput';
import { useAddressSearch } from '../../src/hooks/useAddressSearch';
import { PlaceSuggestion } from '../../src/services/geocoding.service';
import placesService from '../../src/services/places.service';
import colors from '../../src/theme/colors';
import { FavoritePlace, RecentDestination } from '../../src/types/places.types';

export default function NewHomeScreen() {
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
      console.log('Home screen focused - reloading recent destinations');
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
      console.log('Selected place:', place.name);

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

      // Get origin (custom or current location)
      const origin = customOrigin || {
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      };

      // Navigate to trip confirmation screen with place data
      router.push({
        pathname: '/trip-confirmation',
        params: {
          destinationName: place.name,
          destinationAddress: place.description,
          destinationLat: place.latitude,
          destinationLng: place.longitude,
          originLat: customOrigin?.latitude || location?.coords.latitude || 0,
          originLng: customOrigin?.longitude || location?.coords.longitude || 0,
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

    // Navigate to trip confirmation screen
    router.push({
      pathname: '/trip-confirmation',
      params: {
        destinationName: favorite.name,
        destinationAddress: favorite.address || favorite.name,
        destinationLat: favorite.latitude,
        destinationLng: favorite.longitude,
        originLat: customOrigin?.latitude || location?.coords.latitude || 0,
        originLng: customOrigin?.longitude || location?.coords.longitude || 0,
      },
    });
  };

  // Handle recent destination selection
  const handleSelectRecent = (destination: RecentDestination) => {
    // Navigate to trip confirmation screen
    router.push({
      pathname: '/trip-confirmation',
      params: {
        destinationName: destination.name,
        destinationAddress: destination.address,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        originLat: customOrigin?.latitude || location?.coords.latitude || 0,
        originLng: customOrigin?.longitude || location?.coords.longitude || 0,
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
