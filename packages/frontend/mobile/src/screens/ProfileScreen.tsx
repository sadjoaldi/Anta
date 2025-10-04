import { useRouter } from 'expo-router';
import React from 'react';
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
  const { user, logout, loading, isAuthenticated } = useAuth();

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
  logoutButton: {
    margin: 24,
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
