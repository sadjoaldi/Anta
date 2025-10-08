/**
 * Authentication Service for ANTA Mobile
 * Handles all auth-related API calls
 */

import apiClient from './api.client';
import storageService from './storage.service';
import { API_ENDPOINTS } from './api.config';
import {
  User,
  LoginResponse,
  RegisterData,
  LoginData,
  AuthTokens,
} from '../types/api.types';

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.register,
      data
    );

    // Store tokens and user
    await storageService.setTokens(
      response.tokens.accessToken,
      response.tokens.refreshToken
    );
    await storageService.setUser(response.user);

    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      data
    );

    // Store tokens and user
    await storageService.setTokens(
      response.tokens.accessToken,
      response.tokens.refreshToken
    );
    await storageService.setUser(response.user);

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      
      // Call logout endpoint
      await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken });
    } catch (error) {
      // Ignore errors, clean tokens anyway
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      await storageService.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const user = await apiClient.get<User>(API_ENDPOINTS.auth.me);
    
    // Update stored user
    await storageService.setUser(user);
    
    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = await storageService.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string }>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );

    // Store new access token
    await storageService.setAccessToken(response.accessToken);
    
    return response.accessToken;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.changePassword, {
      currentPassword,
      newPassword,
    });

    // Force logout after password change
    await this.logout();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await storageService.isAuthenticated();
  }

  /**
   * Get stored user
   */
  async getStoredUser(): Promise<User | null> {
    return await storageService.getUser();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string, purpose: 'registration' | 'login' | 'reset_password' = 'registration'): Promise<{ expiresIn: number }> {
    const response = await apiClient.post<{ message: string; expiresIn: number }>(
      '/auth/send-otp',
      { phone, purpose }
    );
    return { expiresIn: response.expiresIn };
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phone: string, code: string, purpose: 'registration' | 'login' | 'reset_password' = 'registration'): Promise<{ verified: boolean }> {
    const response = await apiClient.post<{ message: string; verified: boolean }>(
      '/auth/verify-otp',
      { phone, code, purpose }
    );
    return { verified: response.verified };
  }
}

export default new AuthService();
