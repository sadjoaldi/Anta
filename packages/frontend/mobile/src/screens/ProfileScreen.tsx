import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import colors from '../theme/colors';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout, loading, isAuthenticated, refreshUser } = useAuth();
  
  // Get driver profile if exists (from user.driver populated by /auth/me)
  const driverProfile = (user as any)?.driver || null;

  // Rafraîchir le profil quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshUser();
      }
    }, [isAuthenticated])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.subtitle}>Non connecté</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>
          Gérez vos informations et paramètres
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Nom</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Téléphone</Text>
          <Text style={styles.value}>{user.phone}</Text>
        </View>

        {user.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rôle</Text>
          <Text style={[styles.value, styles.roleBadge]}>
            {user.role === 'passenger'
              ? '👤 Passager'
              : user.role === 'driver'
              ? '🚗 Chauffeur'
              : '👑 Admin'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Statut</Text>
          <Text
            style={[
              styles.value,
              user.is_active ? styles.statusActive : styles.statusInactive,
            ]}
          >
            {user.is_active ? '✓ Actif' : '⨯ Inactif'}
          </Text>
        </View>
      </View>

      {/* Status de la demande chauffeur */}
      {driverProfile && driverProfile.kyc_status === 'pending' && (
        <View style={styles.kycPendingCard}>
          <Text style={styles.kycPendingTitle}>⏳ Demande en cours</Text>
          <Text style={styles.kycPendingText}>
            Votre demande pour devenir chauffeur est en cours de vérification.
            Nous vous contacterons sous 24-48h.
          </Text>
        </View>
      )}

      {/* Status rejeté */}
      {driverProfile && driverProfile.kyc_status === 'rejected' && (
        <View style={styles.kycRejectedCard}>
          <Text style={styles.kycRejectedTitle}>❌ Demande refusée</Text>
          <Text style={styles.kycRejectedText}>
            {driverProfile.kyc_rejection_reason || 'Votre demande a été refusée. Veuillez soumettre de nouveaux documents conformes.'}
          </Text>
          <TouchableOpacity
            style={styles.resubmitButton}
            onPress={() => router.push('/driver/complete-profile')}
          >
            <Text style={styles.resubmitButtonText}>📤 Soumettre de nouveaux documents</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton "Devenir chauffeur" uniquement si passager ET pas de profil driver */}
      {user.role === 'passenger' && !driverProfile && (
        <TouchableOpacity
          style={styles.becomeDriverButton}
          onPress={() => router.push('/driver/register')}
        >
          <Text style={styles.becomeDriverText}>🚗 Devenir chauffeur</Text>
          <Text style={styles.becomeDriverSubtext}>
            Gagnez de l'argent en conduisant
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
  },
  statusActive: {
    color: '#4caf50',
    fontWeight: '700',
  },
  statusInactive: {
    color: '#f44336',
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  kycPendingCard: {
    margin: 24,
    marginBottom: 12,
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  kycPendingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#856404',
    marginBottom: 8,
  },
  kycPendingText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  kycRejectedCard: {
    margin: 24,
    marginBottom: 12,
    backgroundColor: '#f8d7da',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  kycRejectedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#721c24',
    marginBottom: 8,
  },
  kycRejectedText: {
    fontSize: 14,
    color: '#721c24',
    lineHeight: 20,
  },
  becomeDriverButton: {
    margin: 24,
    marginBottom: 12,
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  becomeDriverText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  becomeDriverSubtext: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },
  resubmitButton: {
    marginTop: 16,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  resubmitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  logoutButton: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ProfileScreen;
