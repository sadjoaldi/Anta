import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import driverService from '../services/driver.service';
import colors from '../theme/colors';

export default function BecomeDriverScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Vehicle info
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');

  // Driver license
  const [licenseNumber, setLicenseNumber] = useState('');

  // Banking info
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(user?.name || '');

  // Terms acceptance
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (
      !vehicleType ||
      !vehicleBrand ||
      !vehicleModel ||
      !vehicleColor ||
      !vehiclePlate ||
      !licenseNumber
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        'Conditions',
        'Vous devez accepter les conditions pour devenir chauffeur'
      );
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);

      // Créer le profil driver via l'API
      await driverService.createDriverProfile({
        user_id: user.id,
        vehicle_type: vehicleType,
        vehicle_brand: vehicleBrand,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor,
        vehicle_plate: vehiclePlate,
        vehicle_capacity: vehicleCapacity ? parseInt(vehicleCapacity) : undefined,
        license_number: licenseNumber,
        bank_name: bankName || undefined,
        account_number: accountNumber || undefined,
        account_holder: accountHolder || undefined,
      });

      // Rafraîchir le profil utilisateur pour mettre à jour le rôle
      await refreshUser();

      Alert.alert(
        'Demande envoyée ! 🎉',
        'Votre demande pour devenir chauffeur a été envoyée avec succès. Nous examinerons votre dossier dans les 24-48h.\n\nVous pouvez continuer à utiliser l\'application en tant que passager.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/profile'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating driver profile:', error);
      Alert.alert(
        'Erreur',
        error?.message || 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Devenir chauffeur</Text>
        <Text style={styles.subtitle}>
          Remplissez ce formulaire pour commencer à gagner de l'argent
        </Text>
      </View>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Informations du véhicule</Text>

        <Text style={styles.label}>Type de véhicule *</Text>
        <TextInput
          style={styles.input}
          placeholder="Moto, Tricycle, Voiture..."
          value={vehicleType}
          onChangeText={setVehicleType}
          editable={!loading}
        />

        <Text style={styles.label}>Marque *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Yamaha, Honda, Toyota..."
          value={vehicleBrand}
          onChangeText={setVehicleBrand}
          editable={!loading}
        />

        <Text style={styles.label}>Modèle *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: XTZ 125, DT 200..."
          value={vehicleModel}
          onChangeText={setVehicleModel}
          editable={!loading}
        />

        <Text style={styles.label}>Couleur *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Noir, Rouge, Bleu..."
          value={vehicleColor}
          onChangeText={setVehicleColor}
          editable={!loading}
        />

        <Text style={styles.label}>Plaque d'immatriculation *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: GN-123-AB"
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          autoCapitalize="characters"
          editable={!loading}
        />

        <Text style={styles.label}>Capacité (passagers)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 1, 2, 4..."
          value={vehicleCapacity}
          onChangeText={setVehicleCapacity}
          keyboardType="number-pad"
          editable={!loading}
        />
      </View>

      {/* Driver License */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪪 Permis de conduire</Text>

        <Text style={styles.label}>Numéro de permis *</Text>
        <TextInput
          style={styles.input}
          placeholder="Numéro de votre permis de conduire"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          editable={!loading}
        />

        <Text style={styles.note}>
          💡 Les documents (photo du permis, carte d'identité, photos du
          véhicule) seront demandés après validation de ce formulaire.
        </Text>
      </View>

      {/* Banking Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏦 Coordonnées bancaires</Text>

        <Text style={styles.label}>Banque</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ecobank, Société Générale..."
          value={bankName}
          onChangeText={setBankName}
          editable={!loading}
        />

        <Text style={styles.label}>Numéro de compte</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre numéro de compte"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Titulaire du compte</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du titulaire"
          value={accountHolder}
          onChangeText={setAccountHolder}
          editable={!loading}
        />

        <Text style={styles.note}>
          💡 Ces informations serviront pour vos paiements hebdomadaires.
        </Text>
      </View>

      {/* Terms & Conditions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAcceptTerms(!acceptTerms)}
          disabled={loading}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            J'accepte les conditions d'utilisation et m'engage à respecter le
            code de conduite d'ANTA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Soumettre ma demande</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  note: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  submitButton: {
    margin: 24,
    marginBottom: 12,
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
