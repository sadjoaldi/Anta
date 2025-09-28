import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../src/theme/colors';

const TrajetScreen: React.FC = () => {
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
