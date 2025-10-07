/**
 * Authentication Hook for ANTA Admin Dashboard
 */

import { useState, useEffect } from 'react';
import authService from '../services/auth.service';
import type { User } from '../types/api.types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Try to get profile from API
            try {
              const profile = await authService.getProfile();
              setUser(profile);
              setIsAuthenticated(true);
            } catch {
              // Token invalid, logout
              await authService.logout();
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await authService.login({ phone, password });
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };
}
