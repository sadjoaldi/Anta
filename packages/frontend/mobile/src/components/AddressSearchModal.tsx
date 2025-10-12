/**
 * Address Search Modal Component
 * Displays search suggestions with auto-complete
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaceSuggestion } from '../services/geocoding.service';
import colors from '../theme/colors';

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (place: PlaceSuggestion) => void;
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: PlaceSuggestion[];
  loading: boolean;
  placeholder?: string;
}

export default function AddressSearchModal({
  visible,
  onClose,
  onSelectPlace,
  query,
  onQueryChange,
  suggestions,
  loading,
  placeholder = 'Où allez-vous ?',
}: AddressSearchModalProps) {
  
  const handleSelectPlace = (place: PlaceSuggestion) => {
    onSelectPlace(place);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rechercher une adresse</Text>
          <View style={styles.backButton} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={query}
              onChangeText={onQueryChange}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => onQueryChange('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Recherche en cours...</Text>
            </View>
          )}

          {!loading && query.length > 0 && suggestions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
              <Text style={styles.emptySubtext}>
                Essayez une autre recherche
              </Text>
            </View>
          )}

          {!loading && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectPlace(item)}
                >
                  <View style={styles.suggestionIconContainer}>
                    <Ionicons
                      name={getIconForType(item.type)}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          {!loading && query.length === 0 && (
            <View style={styles.instructionsContainer}>
              <Ionicons name="location" size={48} color={colors.primary} />
              <Text style={styles.instructionsText}>
                Recherchez une adresse en Guinée
              </Text>
              <Text style={styles.instructionsSubtext}>
                Ex: Kaloum Market, Ratoma, Matam...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * Get appropriate icon for place type
 */
function getIconForType(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'road':
    case 'highway':
      return 'trail-sign';
    case 'building':
    case 'commercial':
      return 'business';
    case 'residential':
      return 'home';
    case 'amenity':
      return 'storefront';
    case 'suburb':
    case 'neighbourhood':
      return 'business';
    case 'city':
    case 'town':
      return 'location';
    default:
      return 'location-outline';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  instructionsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 68,
  },
});
