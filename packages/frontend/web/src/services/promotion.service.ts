/**
 * Promotion Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { Promotion } from '../types/api.types';

class PromotionService {
  /**
   * Get all promotions with pagination
   */
  async getPromotions(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<{ data: Promotion[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `/promotions?${queryParams.toString()}`;
    return await apiClient.getPaginated<Promotion[]>(url);
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: number): Promise<Promotion> {
    return await apiClient.get<Promotion>(`/promotions/${id}`);
  }

  /**
   * Create promotion
   */
  async createPromotion(data: {
    code: string;
    description?: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    min_trip_amount?: number;
    max_discount?: number;
    usage_limit?: number;
    usage_per_user?: number;
    valid_from?: string;
    valid_until?: string;
  }): Promise<Promotion> {
    return await apiClient.post<Promotion>('/promotions', data);
  }

  /**
   * Update promotion
   */
  async updatePromotion(id: number, data: Partial<Promotion>): Promise<Promotion> {
    return await apiClient.put<Promotion>(`/promotions/${id}`, data);
  }

  /**
   * Toggle promotion active status
   */
  async togglePromotion(id: number): Promise<Promotion> {
    return await apiClient.patch<Promotion>(`/promotions/${id}/toggle`);
  }

  /**
   * Delete promotion
   */
  async deletePromotion(id: number): Promise<void> {
    return await apiClient.delete(`/promotions/${id}`);
  }

  /**
   * Get promotion usage stats
   */
  async getPromotionStats(id: number): Promise<{
    promotion: Promotion;
    stats: {
      total_uses: number;
      total_discount: number;
      unique_users: number;
    };
  }> {
    return await apiClient.get(`/promotions/${id}/stats`);
  }
}

export default new PromotionService();
