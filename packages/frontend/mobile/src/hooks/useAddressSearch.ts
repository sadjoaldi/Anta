/**
 * Custom hook for address search with debounce
 */

import { useCallback, useEffect, useRef, useState } from "react";
import geocodingService, {
  PlaceSuggestion,
} from "../services/geocoding.service";

interface UseAddressSearchOptions {
  /** Minimum characters before searching */
  minChars?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** User's current location for biased results */
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const useAddressSearch = (options: UseAddressSearchOptions = {}) => {
  const { minChars = 3, debounceMs = 500, userLocation } = options;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout>(null);

  /**
   * Perform the search
   */
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < minChars) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let results: PlaceSuggestion[];

        // Use nearby search if user location is available
        if (userLocation) {
          results = await geocodingService.searchNearby(
            searchQuery,
            userLocation.latitude,
            userLocation.longitude,
            10
          );
        } else {
          results = await geocodingService.searchPlaces(searchQuery, 10);
        }

        setSuggestions(results);
      } catch (err) {
        console.error("Address search error:", err);
        setError("Erreur lors de la recherche");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [minChars, userLocation]
  );

  /**
   * Handle query change with debounce
   */
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Don't search if query is too short
      if (newQuery.trim().length < minChars) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Set loading immediately for UX feedback
      setLoading(true);

      // Debounce the search
      debounceTimer.current = setTimeout(() => {
        performSearch(newQuery);
      }, debounceMs);
    },
    [minChars, debounceMs, performSearch]
  );

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setError(null);
    setLoading(false);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    suggestions,
    loading,
    error,
    handleQueryChange,
    clearSearch,
  };
};
