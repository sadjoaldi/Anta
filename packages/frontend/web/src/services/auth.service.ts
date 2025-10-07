/**
 * Authentication Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { LoginData, LoginResponse, User } from '../types/api.types';

class AuthService {
  /**
   * Login admin user
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    // Store tokens
    localStorage.setItem('accessToken', response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
    
    // Store user
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const user = await apiClient.get<User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  }
}

export default new AuthService();
