/**
 * Auth Context for ANTA Mobile
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import { User, RegisterData, LoginData, ApiError } from '../types/api.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Try to get profile from API
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (err) {
          // If API fails, get stored user
          const storedUser = await authService.getStoredUser();
          setUser(storedUser);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(data);
      setUser(response.user);
    } catch (err) {
      const errorMsg = err instanceof ApiError 
        ? err.message 
        : 'Registration failed. Please try again.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(data);
      setUser(response.user);
    } catch (err) {
      const errorMsg = err instanceof ApiError 
        ? err.message 
        : 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('❌ Login failed:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Clear user anyway
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user profile
   */
  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Refresh user error:', err);
      throw err;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
