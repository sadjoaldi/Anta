/**
 * Recent Destinations Component
 * Displays a list of recent search destinations with swipe to delete
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { RecentDestination } from '../types/places.types';
import colors from '../theme/colors';

interface RecentDestinationsProps {
  destinations: RecentDestination[];
  onSelectDestination: (destination: RecentDestination) => void;
  onDeleteDestination: (id: string) => void;
  onClearAll: () => void;
}

export default function RecentDestinations({
  destinations,
  onSelectDestination,
  onDeleteDestination,
  onClearAll,
}: RecentDestinationsProps) {
  if (destinations.length === 0) {
    return null;
  }

  const handleClearAll = () => {
    Alert.alert(
      'Effacer l\'historique',
      'Voulez-vous supprimer toutes les destinations récentes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Effacer', 
          style: 'destructive',
          onPress: onClearAll 
        },
      ]
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${name}" de l'historique ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onDeleteDestination(id) 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕐 Récemment</Text>
        <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
          <Text style={styles.clearButton}>Effacer tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {destinations.map((destination) => (
          <View key={destination.id} style={styles.itemWrapper}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelectDestination(destination)}
              onLongPress={() => handleDelete(destination.id, destination.name)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {destination.name}
                </Text>
                <Text style={styles.address} numberOfLines={1}>
                  {destination.address}
                </Text>
              </View>

              {destination.frequency > 1 && (
                <View style={styles.frequencyBadge}>
                  <Text style={styles.frequencyText}>{destination.frequency}x</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => handleDelete(destination.id, destination.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearButton: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500',
  },
  list: {
    gap: 8,
  },
  itemWrapper: {
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: '#666',
  },
  frequencyBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
