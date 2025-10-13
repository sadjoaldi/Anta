/**
 * Places Service
 * Manages favorite places and destination history
 * Uses AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoritePlace, RecentDestination } from '../types/places.types';

const FAVORITES_KEY = '@anta:favorites';
const RECENT_KEY = '@anta:recent_destinations';
const MAX_RECENT = 10; // Keep only 10 most recent

class PlacesService {
  // ============ FAVORITES ============

  /**
   * Get all favorite places
   */
  async getFavorites(): Promise<FavoritePlace[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!data) return this.getDefaultFavorites();
      
      const favorites = JSON.parse(data);
      // Convert date strings back to Date objects
      return favorites.map((fav: any) => ({
        ...fav,
        createdAt: new Date(fav.createdAt),
        updatedAt: new Date(fav.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading favorites:', error);
      return this.getDefaultFavorites();
    }
  }

  /**
   * Get default favorites (Home, Work, Other)
   */
  private getDefaultFavorites(): FavoritePlace[] {
    return [
      {
        id: 'home',
        name: 'Maison',
        icon: '🏠',
        address: null,
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'work',
        name: 'Travail',
        icon: '💼',
        address: null,
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'other',
        name: 'Autre',
        icon: '⭐',
        address: null,
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Save favorite place
   */
  async saveFavorite(favorite: Omit<FavoritePlace, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const existingIndex = favorites.findIndex(f => f.id === favorite.id);

      const now = new Date();
      const newFavorite: FavoritePlace = {
        ...favorite,
        createdAt: existingIndex >= 0 ? favorites[existingIndex].createdAt : now,
        updatedAt: now,
      };

      if (existingIndex >= 0) {
        favorites[existingIndex] = newFavorite;
      } else {
        favorites.push(newFavorite);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
      throw error;
    }
  }

  /**
   * Delete favorite place
   */
  async deleteFavorite(id: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(f => f.id !== id);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting favorite:', error);
      throw error;
    }
  }

  // ============ RECENT DESTINATIONS ============

  /**
   * Get recent destinations (sorted by frequency + recency)
   */
  async getRecentDestinations(): Promise<RecentDestination[]> {
    try {
      const data = await AsyncStorage.getItem(RECENT_KEY);
      if (!data) return [];

      const recent = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return recent
        .map((dest: any) => ({
          ...dest,
          timestamp: new Date(dest.timestamp),
        }))
        .sort((a: RecentDestination, b: RecentDestination) => {
          // Sort by frequency first, then by recency
          if (a.frequency !== b.frequency) {
            return b.frequency - a.frequency;
          }
          return b.timestamp.getTime() - a.timestamp.getTime();
        })
        .slice(0, MAX_RECENT);
    } catch (error) {
      console.error('Error loading recent destinations:', error);
      return [];
    }
  }

  /**
   * Add destination to recent history
   */
  async addRecentDestination(destination: Omit<RecentDestination, 'id' | 'timestamp' | 'frequency'>): Promise<void> {
    try {
      const recent = await this.getRecentDestinations();
      
      // Check if destination already exists (by coordinates)
      const existingIndex = recent.findIndex(
        dest =>
          Math.abs(dest.latitude - destination.latitude) < 0.0001 &&
          Math.abs(dest.longitude - destination.longitude) < 0.0001
      );

      if (existingIndex >= 0) {
        // Update existing: increment frequency and timestamp
        recent[existingIndex].frequency += 1;
        recent[existingIndex].timestamp = new Date();
        recent[existingIndex].name = destination.name; // Update name in case it changed
        recent[existingIndex].address = destination.address;
      } else {
        // Add new destination
        const newDestination: RecentDestination = {
          ...destination,
          id: `recent_${Date.now()}`,
          timestamp: new Date(),
          frequency: 1,
        };
        recent.unshift(newDestination);
      }

      // Keep only MAX_RECENT items
      const trimmed = recent.slice(0, MAX_RECENT);

      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error adding recent destination:', error);
      throw error;
    }
  }

  /**
   * Remove destination from recent history
   */
  async removeRecentDestination(id: string): Promise<void> {
    try {
      const recent = await this.getRecentDestinations();
      const filtered = recent.filter(dest => dest.id !== id);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing recent destination:', error);
      throw error;
    }
  }

  /**
   * Clear all recent destinations
   */
  async clearRecentDestinations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_KEY);
    } catch (error) {
      console.error('Error clearing recent destinations:', error);
      throw error;
    }
  }
}

export default new PlacesService();
