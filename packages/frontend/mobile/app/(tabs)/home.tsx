import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AddressSearchModal from "../../src/components/AddressSearchModal";
import { useAddressSearch } from "../../src/hooks/useAddressSearch";
import driverService, { Driver } from "../../src/services/driver.service";
import { PlaceSuggestion } from "../../src/services/geocoding.service";
import colors from "../../src/theme/colors";

const { height } = Dimensions.get("window");

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
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [destination, setDestination] = useState<PlaceSuggestion | null>(null);

  const mapRef = useRef<MapView>(null);

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

  // Dummy data - À remplacer par de vraies données du backend
  const [savedPlaces] = useState<SavedPlace[]>([
    { id: "1", name: "Maison", icon: "home" },
    { id: "2", name: "Travail", icon: "briefcase" },
  ]);

  const [recentDestinations] = useState<RecentDestination[]>([
    { id: "1", address: "Kaloum Market, Conakry", timestamp: new Date() },
    { id: "2", address: "Ratoma Center", timestamp: new Date() },
    { id: "3", address: "Matam Avenue", timestamp: new Date() },
  ]);

  // Load available drivers
  const loadNearbyDrivers = async (latitude: number, longitude: number) => {
    try {
      setLoadingDrivers(true);
      const response = await driverService.getAvailableDrivers(
        latitude,
        longitude,
        5000
      );
      setDrivers(response.drivers);
    } catch (error) {
      console.error("❌ Error loading drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission refusée");
        Alert.alert(
          "Permission requise",
          "ANTA a besoin d'accéder à votre position pour fonctionner"
        );
        return;
      }

      // Get current location
      try {
        // 🔧 DEV MODE: Force location to Conakry for testing
        const DEV_MODE = true; // Set to false to use real GPS

        let location;
        if (DEV_MODE) {
          // Simulate location in Conakry, Guinea (slightly offset from driver position)
          location = {
            coords: {
              latitude: 9.645, // Décalé de ~400m au nord
              longitude: -13.582, // Décalé de ~300m à l'ouest
              altitude: 0,
              accuracy: 100,
              altitudeAccuracy: 0,
              heading: 0,
              speed: 0,
            },
            timestamp: Date.now(),
          } as Location.LocationObject;
        } else {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
        }

        setLocation(location);

        // Load nearby drivers
        await loadNearbyDrivers(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Impossible de récupérer votre position");
      }
    })();
  }, []);

  // Refresh drivers every 10 seconds
  useEffect(() => {
    if (!location) return;

    const interval = setInterval(() => {
      loadNearbyDrivers(location.coords.latitude, location.coords.longitude);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [location]);

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

  const handleSavedPlaceSelect = (place: SavedPlace) => {
    // TODO: Navigate to booking flow with saved place
    Alert.alert("Lieu sélectionné", `Vous avez choisi: ${place.name}`);
  };

  const handleRecentSelect = (recentDest: RecentDestination) => {
    // TODO: Navigate to booking flow with destination
    Alert.alert("Destination sélectionnée", recentDest.address);
  };

  const handleSearchPress = () => {
    setSearchModalVisible(true);
  };

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setDestination(place);
    clearSearch();
    setSearchModalVisible(false);

    console.log("Selected place:", place.name, `(${place.latitude}, ${place.longitude})`);

    // Animate map to show both user location and destination
    if (location && mapRef.current) {
      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;
      const destLat = place.latitude;
      const destLng = place.longitude;

      // Calculate center point and deltas to show both locations
      const centerLat = (userLat + destLat) / 2;
      const centerLng = (userLng + destLng) / 2;
      
      const latDelta = Math.abs(userLat - destLat) * 2.5 + 0.02;
      const lngDelta = Math.abs(userLng - destLng) * 2.5 + 0.02;

      const region = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      };

      console.log("Animating to region:", region);
      mapRef.current.animateToRegion(region, 1000);
    } else if (mapRef.current) {
      // If no user location, just focus on destination
      mapRef.current.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }

    console.log(
      "Destination set:",
      place.name,
      `(${place.latitude}, ${place.longitude})`
    );
  };

  const handleClearDestination = () => {
    setDestination(null);
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
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
            pinColor={colors.primary}
          />
        )}

        {/* Driver markers */}
        {drivers.map((driver) => {
          if (!driver.current_latitude || !driver.current_longitude)
            return null;

          return (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.current_latitude,
                longitude: driver.current_longitude,
              }}
              pinColor="#4CAF50"
            >
              <View style={styles.driverMarker}>
                <Ionicons
                  name={driver.vehicle_type === "Moto" ? "bicycle" : "car"}
                  size={20}
                  color="#fff"
                />
              </View>
              <Callout style={styles.callout}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutName}>
                    {driver.user?.name || "Chauffeur"}
                  </Text>
                  <View style={styles.calloutInfo}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.calloutRating}>
                      {Number(driver.rating_avg || 0).toFixed(1)}
                    </Text>
                    <Text style={styles.calloutTrips}>
                      ({Number(driver.total_trips || 0)} courses)
                    </Text>
                  </View>
                  {driver.distance && (
                    <Text style={styles.calloutDistance}>
                      À {(driver.distance / 1000).toFixed(1)} km
                    </Text>
                  )}
                  {driver.vehicle_type && (
                    <Text style={styles.calloutVehicle}>
                      {driver.vehicle_brand || "N/A"}{" "}
                      {driver.vehicle_model || ""}{" "}
                      {driver.vehicle_color ? `(${driver.vehicle_color})` : ""}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            pinColor={colors.danger}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={24} color="#fff" />
            </View>
            <Callout>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutName}>{destination.name}</Text>
                <Text style={styles.calloutVehicle}>
                  {destination.description}
                </Text>
              </View>
            </Callout>
          </Marker>
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
          {/* Drivers Count Badge */}
          {drivers.length > 0 && (
            <View style={styles.driversBadge}>
              <Ionicons name="car" size={16} color="#4CAF50" />
              <Text style={styles.driversBadgeText}>
                {drivers.length} chauffeur{drivers.length > 1 ? "s" : ""}{" "}
                disponible{drivers.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Search Input / Destination Display */}
          <View style={styles.searchContainer}>
            {destination ? (
              <View style={styles.destinationDisplay}>
                <View style={styles.destinationIconContainer}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.destinationTextContainer}>
                  <Text style={styles.destinationName}>{destination.name}</Text>
                  <Text style={styles.destinationDescription} numberOfLines={1}>
                    {destination.description}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearDestination}>
                  <Ionicons name="close-circle" size={24} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.searchInputWrapper}
                onPress={handleSearchPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color="#999"
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPlaceholder}>Où allez-vous ?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Access - Saved Places */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 RACCOURCIS</Text>
            <View style={styles.savedPlacesContainer}>
              {savedPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.savedPlaceButton}
                  onPress={() => handleSavedPlaceSelect(place)}
                >
                  <Ionicons
                    name={place.icon}
                    size={20}
                    color={colors.primary}
                  />
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
                  <Text style={styles.recentAddress}>
                    {destination.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Address Search Modal */}
      <AddressSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectPlace={handleSelectPlace}
        query={query}
        onQueryChange={handleQueryChange}
        suggestions={suggestions}
        loading={searchLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetExpanded: {
    height: height * 0.7,
  },
  handle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  driversBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    marginBottom: 16,
  },
  driversBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  savedPlacesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  savedPlaceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  savedPlaceText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  savedPlaceTextAdd: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentAddress: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  // Driver marker styles
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Callout styles
  callout: {
    minWidth: 200,
  },
  calloutContent: {
    padding: 10,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  calloutInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  calloutRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  calloutTrips: {
    fontSize: 12,
    color: "#666",
  },
  calloutDistance: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  calloutVehicle: {
    fontSize: 12,
    color: "#666",
  },
  // Destination marker styles
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Destination display styles
  destinationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  destinationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destinationTextContainer: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  destinationDescription: {
    fontSize: 13,
    color: "#666",
  },
  // Search placeholder
  searchPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
});
