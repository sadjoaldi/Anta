import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import driverProfileService from '../services/driverProfile.service';
import storageService from '../services/storage.service';
import { theme } from '../theme/theme';

interface DriverProfileGuardProps {
  children: React.ReactNode;
}

/**
 * Composant qui vérifie si le chauffeur a complété son profil
 * Si non, redirige vers la page de complétion
 */
export default function DriverProfileGuard({ children }: DriverProfileGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkDriverProfile();
  }, [pathname]);

  const checkDriverProfile = async () => {
    try {
      // Ne vérifier que si on est authentifié
      const tokens = await storageService.getTokens();
      if (!tokens) {
        setChecking(false);
        return;
      }

      // Ne pas vérifier sur certaines pages
      const excludedPaths = [
        '/driver/complete-profile',
        '/auth/login',
        '/auth/register',
      ];
      
      if (excludedPaths.some(path => pathname?.includes(path))) {
        setChecking(false);
        return;
      }

      // Récupérer le profil utilisateur
      const userData = await storageService.getUserData();
      if (!userData || userData.role !== 'driver') {
        setChecking(false);
        return;
      }

      // Vérifier si le profil nécessite une complétion
      const needsCompletion = await driverProfileService.needsProfileCompletion(userData.id);
      
      if (needsCompletion && !pathname?.includes('complete-profile')) {
        // Rediriger vers la page de complétion
        router.replace('/driver/complete-profile');
      }
      
      setChecking(false);
    } catch (error) {
      console.error('Error checking driver profile:', error);
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
