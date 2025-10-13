/**
 * Promoted Places Component
 * Displays advertising spots for restaurants, tourist attractions, etc.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../theme/colors';

export interface PromotedPlace {
  id: string;
  name: string;
  category: string;
  image?: string;
  rating?: number;
  distance?: string;
  description?: string;
}

interface PromotedPlacesProps {
  places: PromotedPlace[];
  onSelectPlace: (place: PromotedPlace) => void;
}

export default function PromotedPlaces({
  places,
  onSelectPlace,
}: PromotedPlacesProps) {
  if (places.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Découvrez</Text>
        <Text style={styles.subtitle}>
          Restaurants, lieux à visiter et plus
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {places.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.card}
            onPress={() => onSelectPlace(place)}
            activeOpacity={0.8}
          >
            {place.image ? (
              <Image source={{ uri: place.image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.placeName} numberOfLines={1}>
                {place.name}
              </Text>

              <Text style={styles.category} numberOfLines={1}>
                {place.category}
              </Text>

              <View style={styles.meta}>
                {place.rating && (
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text style={styles.ratingText}>{place.rating}</Text>
                  </View>
                )}

                {place.distance && (
                  <Text style={styles.distance}>{place.distance}</Text>
                )}
              </View>

              {place.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {place.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  card: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  distance: {
    fontSize: 11,
    color: '#999',
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
