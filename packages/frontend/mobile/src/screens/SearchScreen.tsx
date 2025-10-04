import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche</Text>
      <Text style={styles.subtitle}>Cherchez une destination et lancez un trajet</Text>
      <TouchableOpacity style={styles.cta}>
        <Text style={styles.ctaText}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  subtitle: { marginTop: 8, color: '#555' },
  cta: { marginTop: 24, backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600' }
});

export default SearchScreen;
