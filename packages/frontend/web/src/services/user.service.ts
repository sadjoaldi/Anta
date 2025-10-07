/**
 * User Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { User } from '../types/api.types';

class UserService {
  /**
   * Get all users with filters and pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    filter?: string; // 'new_today', 'active'
  }): Promise<{ data: User[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filter) queryParams.append('filter', params.filter);

    const url = `/users?${queryParams.toString()}`;
    return await apiClient.getPaginated<User[]>(url);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    return await apiClient.get<User>(`/users/${id}`);
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: number): Promise<User> {
    return await apiClient.patch<User>(`/users/${userId}/suspend`);
  }

  /**
   * Activate user
   */
  async activateUser(userId: number): Promise<User> {
    return await apiClient.patch<User>(`/users/${userId}/activate`);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<void> {
    return await apiClient.delete(`/users/${userId}`);
  }
}

export default new UserService();
