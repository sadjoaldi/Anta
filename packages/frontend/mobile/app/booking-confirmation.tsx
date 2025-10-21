/**
 * Booking Confirmation Screen
 * Allows user to review trip details and confirm booking
 * Features swipeable cards for vehicle type selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ridesService from '../src/services/rides.service';

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

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  priceMultiplier: number;
  capacity: string;
  description: string;
}

const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'moto',
    name: 'Moto',
    icon: '🏍️',
    priceMultiplier: 1,
    capacity: '1 passager',
    description: 'Rapide et économique',
  },
  {
    id: 'car',
    name: 'Voiture',
    icon: '🚗',
    priceMultiplier: 1.5,
    capacity: '3-4 passagers',
    description: 'Confortable et spacieux',
  },
  {
    id: 'van',
    name: 'Van',
    icon: '🚐',
    priceMultiplier: 2,
    capacity: '6-8 passagers',
    description: 'Pour les groupes',
  },
];

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params
  const driverName = params.driverName as string;
  const driverRating = params.driverRating as string;
  const driverVehicle = params.driverVehicle as string;
  const driverDistance = params.driverDistance as string;
  const originName = params.originName as string;
  const destinationName = params.destinationName as string;
  const distance = params.distance as string;
  const duration = params.duration as string;
  const basePrice = parseInt(params.price as string) || 0;

  // State
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [passengers, setPassengers] = useState('1');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const selectedVehicle = VEHICLE_TYPES[selectedVehicleIndex];
  const finalPrice = Math.round(basePrice * selectedVehicle.priceMultiplier);

  const handleConfirmBooking = async () => {
    if (!passengers || parseInt(passengers) < 1) {
      Alert.alert('Erreur', 'Veuillez indiquer le nombre de passagers');
      return;
    }

    setIsBooking(true);

    try {
      // Parse coordinates from params
      const originLat = parseFloat(params.originLat as string);
      const originLng = parseFloat(params.originLng as string);
      const destLat = parseFloat(params.destinationLat as string);
      const destLng = parseFloat(params.destinationLng as string);

      // Parse distance and duration (extract numbers)
      const distanceStr = distance.replace(/[^0-9.]/g, '');
      const distanceKm = parseFloat(distanceStr) || 0;
      const distanceMeters = Math.round(distanceKm * 1000);

      const durationStr = duration.replace(/[^0-9]/g, '');
      const durationMin = parseInt(durationStr) || 0;
      const durationSeconds = durationMin * 60;

      // Create ride (passengerId is extracted from JWT token on backend)
      const ride = await ridesService.createRide({
        driverId: parseInt(params.driverId as string),
        originLat,
        originLng,
        originAddress: originName,
        destLat,
        destLng,
        destAddress: destinationName,
        distance: distanceMeters,
        duration: durationSeconds,
        estimatedPrice: finalPrice,
        vehicleType: selectedVehicle.id,
        passengers: parseInt(passengers),
        notes,
      });

      Alert.alert(
        'Réservation confirmée ! 🎉',
        `Le chauffeur ${driverName} a été notifié. Vous recevrez une notification lorsqu'il acceptera.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/home'),
          },
        ]
      );

      console.log('Ride created:', ride);
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer la réservation. Veuillez réessayer.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmer la réservation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajet</Text>
          <View style={styles.tripCard}>
            <View style={styles.tripRow}>
              <View style={styles.tripDot} />
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Départ</Text>
                <Text style={styles.tripValue}>{originName}</Text>
              </View>
            </View>
            <View style={styles.tripLine} />
            <View style={styles.tripRow}>
              <View style={[styles.tripDot, styles.tripDotDestination]} />
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Arrivée</Text>
                <Text style={styles.tripValue}>{destinationName}</Text>
              </View>
            </View>
            <View style={styles.tripMeta}>
              <View style={styles.tripMetaItem}>
                <Ionicons name="speedometer-outline" size={14} color={colors.textLight} />
                <Text style={styles.tripMetaText}> {distance}</Text>
              </View>
              <View style={styles.tripMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={styles.tripMetaText}> {duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chauffeur</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName}</Text>
              <View style={styles.driverMeta}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.driverRating}>{driverRating}</Text>
                <Text style={styles.driverVehicle}> • {driverVehicle}</Text>
              </View>
              {driverDistance && (
                <View style={styles.driverDistanceContainer}>
                  <Ionicons name="location-outline" size={12} color={colors.primary} />
                  <Text style={styles.driverDistance}> À {driverDistance}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Vehicle Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de véhicule</Text>
          <View style={styles.vehicleButtonsContainer}>
            {VEHICLE_TYPES.map((vehicle, index) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleButton,
                  selectedVehicleIndex === index && styles.vehicleButtonSelected,
                ]}
                onPress={() => setSelectedVehicleIndex(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
                <Text style={styles.vehiclePrice}>
                  {Math.round(basePrice * vehicle.priceMultiplier).toLocaleString()} GNF
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Passengers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de passagers</Text>
          <View style={styles.passengersContainer}>
            <TouchableOpacity
              style={styles.passengerButton}
              onPress={() => setPassengers(String(Math.max(1, parseInt(passengers) - 1)))}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.passengerInput}
              value={passengers}
              onChangeText={setPassengers}
              keyboardType="number-pad"
              maxLength={1}
            />
            <TouchableOpacity
              style={styles.passengerButton}
              onPress={() => setPassengers(String(Math.min(9, parseInt(passengers) + 1)))}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions spéciales (optionnel)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: J'ai des bagages, j'arrive dans 5 min..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>{notes.length}/200</Text>
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix de base</Text>
            <Text style={styles.priceValue}>{basePrice.toLocaleString()} GNF</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Type de véhicule</Text>
            <Text style={styles.priceValue}>x{selectedVehicle.priceMultiplier}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelTotal}>Total estimé</Text>
            <Text style={styles.priceTotal}>{finalPrice.toLocaleString()} GNF</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isBooking}
          activeOpacity={0.8}
        >
          {isBooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
              <Text style={styles.confirmButtonPrice}>{finalPrice.toLocaleString()} GNF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 4,
  },
  tripDotDestination: {
    backgroundColor: colors.danger,
  },
  tripLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  tripInfo: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  tripValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tripMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripMetaText: {
    fontSize: 13,
    color: colors.textLight,
    marginLeft: 4,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  driverVehicle: {
    fontSize: 13,
    color: colors.textLight,
  },
  driverDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  driverDistance: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  vehicleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  vehicleButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  vehicleCapacity: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
  },
  vehicleDescription: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 6,
  },
  vehiclePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 24,
  },
  passengerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInput: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    minWidth: 60,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  priceLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priceTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonPrice: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
});
