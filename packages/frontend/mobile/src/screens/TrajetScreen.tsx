import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import DriverTripsScreen from './DriverTripsScreen';

const TrajetScreen: React.FC = () => {
  const { user } = useAuth();

  // If driver, show driver trips screen
  if (user?.role === 'driver') {
    return <DriverTripsScreen />;
  }

  // Passenger trips screen (to be implemented)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trajets</Text>
      <Text style={styles.subtitle}>Vos trajets en cours et à venir</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  subtitle: { marginTop: 8, color: '#555' }
});

export default TrajetScreen;
