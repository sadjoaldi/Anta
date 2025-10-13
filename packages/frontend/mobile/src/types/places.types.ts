/**
 * Types for favorite places and destination history
 */

export interface FavoritePlace {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecentDestination {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  frequency: number; // How many times visited
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
}
