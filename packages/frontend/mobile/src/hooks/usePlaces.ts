/**
 * usePlaces Hook
 * Manages favorite places and recent destinations
 */

import { useCallback, useEffect, useState } from 'react';
import placesService from '../services/places.service';
import { FavoritePlace, RecentDestination } from '../types/places.types';

export const usePlaces = () => {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<RecentDestination[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [favs, recent] = await Promise.all([
        placesService.getFavorites(),
        placesService.getRecentDestinations(),
      ]);
      setFavorites(favs);
      setRecentDestinations(recent);
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFavorites = useCallback(async () => {
    const favs = await placesService.getFavorites();
    setFavorites(favs);
  }, []);

  const refreshRecent = useCallback(async () => {
    const recent = await placesService.getRecentDestinations();
    setRecentDestinations(recent);
  }, []);

  const saveFavorite = useCallback(
    async (favorite: Omit<FavoritePlace, 'createdAt' | 'updatedAt'>) => {
      await placesService.saveFavorite(favorite);
      await refreshFavorites();
    },
    [refreshFavorites]
  );

  const deleteFavorite = useCallback(
    async (id: string) => {
      await placesService.deleteFavorite(id);
      await refreshFavorites();
    },
    [refreshFavorites]
  );

  const addRecentDestination = useCallback(
    async (
      destination: Omit<RecentDestination, 'id' | 'timestamp' | 'frequency'>
    ) => {
      await placesService.addRecentDestination(destination);
      await refreshRecent();
    },
    [refreshRecent]
  );

  const removeRecentDestination = useCallback(
    async (id: string) => {
      await placesService.removeRecentDestination(id);
      await refreshRecent();
    },
    [refreshRecent]
  );

  const clearRecentDestinations = useCallback(async () => {
    await placesService.clearRecentDestinations();
    await refreshRecent();
  }, [refreshRecent]);

  return {
    favorites,
    recentDestinations,
    loading,
    saveFavorite,
    deleteFavorite,
    addRecentDestination,
    removeRecentDestination,
    clearRecentDestinations,
    refreshFavorites,
    refreshRecent,
  };
};
