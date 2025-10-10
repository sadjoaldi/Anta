import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../src/theme/colors';

const { height } = Dimensions.get('window');

interface SavedPlace {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface RecentDestination {
  id: string;
  address: string;
  timestamp: Date;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  // Dummy data - À remplacer par de vraies données du backend
  const [savedPlaces] = useState<SavedPlace[]>([
    { id: '1', name: 'Maison', icon: 'home' },
    { id: '2', name: 'Travail', icon: 'briefcase' },
  ]);

  const [recentDestinations] = useState<RecentDestination[]>([
    { id: '1', address: 'Kaloum Market, Conakry', timestamp: new Date() },
    { id: '2', address: 'Ratoma Center', timestamp: new Date() },
    { id: '3', address: 'Matam Avenue', timestamp: new Date() },
  ]);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission refusée');
        Alert.alert(
          'Permission requise',
          'ANTA a besoin d\'accéder à votre position pour fonctionner'
        );
        return;
      }

      // Get current location
      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Impossible de récupérer votre position');
      }
    })();
  }, []);

  const handleCenterOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handlePlaceSelect = (place: SavedPlace) => {
    setSearchQuery(place.name);
    // TODO: Navigate to booking flow with saved place
    Alert.alert('Lieu sélectionné', `Vous avez choisi: ${place.name}`);
  };

  const handleRecentSelect = (destination: RecentDestination) => {
    setSearchQuery(destination.address);
    // TODO: Navigate to booking flow with destination
    Alert.alert('Destination sélectionnée', destination.address);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // TODO: Navigate to booking flow with search query
      Alert.alert('Recherche', `Recherche de: ${searchQuery}`);
    }
  };

  // Default region (Conakry, Guinea) if no location yet
  const initialRegion = {
    latitude: location?.coords.latitude || 9.6412,
    longitude: location?.coords.longitude || -13.5784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        loadingEnabled
      >
        {/* User location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Votre position"
          />
        )}
      </MapView>

      {/* Center on user button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={handleCenterOnUser}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View
        style={[
          styles.bottomSheet,
          bottomSheetExpanded && styles.bottomSheetExpanded,
        ]}
      >
        {/* Handle */}
        <TouchableOpacity
          style={styles.handle}
          onPress={() => setBottomSheetExpanded(!bottomSheetExpanded)}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        <ScrollView
          style={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Où allez-vous ?"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Access - Saved Places */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 RACCOURCIS</Text>
            <View style={styles.savedPlacesContainer}>
              {savedPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.savedPlaceButton}
                  onPress={() => handlePlaceSelect(place)}
                >
                  <Ionicons name={place.icon} size={20} color={colors.primary} />
                  <Text style={styles.savedPlaceText}>{place.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.savedPlaceButton}>
                <Ionicons name="add-circle-outline" size={20} color="#999" />
                <Text style={styles.savedPlaceTextAdd}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Destinations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 RÉCENTS</Text>
            {recentDestinations.map((destination) => (
              <TouchableOpacity
                key={destination.id}
                style={styles.recentItem}
                onPress={() => handleRecentSelect(destination)}
              >
                <View style={styles.recentIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentAddress}>{destination.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
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
  centerButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetExpanded: {
    height: height * 0.7,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  savedPlacesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  savedPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  savedPlaceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  savedPlaceTextAdd: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentAddress: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
});
