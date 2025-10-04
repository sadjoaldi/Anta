/**
 * Storage Service for ANTA Mobile
 * Wrapper around AsyncStorage for token management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@anta:accessToken',
  REFRESH_TOKEN: '@anta:refreshToken',
  USER: '@anta:user',
} as const;

class StorageService {
  /**
   * Store access token
   */
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  }

  /**
   * Store both tokens
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  }

  /**
   * Store user data
   */
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  async getUser(): Promise<any | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear all auth data
   */
  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER,
    ]);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export default new StorageService();
