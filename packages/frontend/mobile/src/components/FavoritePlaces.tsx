/**
 * Favorite Places Component
 * Displays a grid of favorite destinations (Home, Work, Other)
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FavoritePlace } from '../types/places.types';
import colors from '../theme/colors';

interface FavoritePlacesProps {
  favorites: FavoritePlace[];
  onSelectFavorite: (favorite: FavoritePlace) => void;
  onEditFavorite: (favorite: FavoritePlace) => void;
}

export default function FavoritePlaces({
  favorites,
  onSelectFavorite,
  onEditFavorite,
}: FavoritePlacesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Destinations favorites</Text>
      
      <View style={styles.grid}>
        {favorites.map((favorite) => (
          <TouchableOpacity
            key={favorite.id}
            style={styles.favoriteCard}
            onPress={() => {
              if (favorite.address) {
                onSelectFavorite(favorite);
              } else {
                onEditFavorite(favorite);
              }
            }}
            onLongPress={() => onEditFavorite(favorite)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{favorite.icon}</Text>
            </View>
            
            <Text style={styles.favoriteName} numberOfLines={1}>
              {favorite.name}
            </Text>
            
            {favorite.address ? (
              <Text style={styles.favoriteAddress} numberOfLines={2}>
                {favorite.address}
              </Text>
            ) : (
              <View style={styles.notConfigured}>
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.notConfiguredText}>Configurer</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 120,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  favoriteAddress: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  notConfigured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  notConfiguredText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
});
