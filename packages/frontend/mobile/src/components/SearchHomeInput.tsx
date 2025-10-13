/**
 * Search Home Input Component
 * Main search input for destination on home screen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

interface SearchHomeInputProps {
  onPress: () => void;
  placeholder?: string;
}

export default function SearchHomeInput({
  onPress,
  placeholder = 'Où allez-vous ?',
}: SearchHomeInputProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color={colors.primary} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
