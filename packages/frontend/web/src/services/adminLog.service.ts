/**
 * Admin Log Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { AdminLog } from '../types/api.types';

class AdminLogService {
  /**
   * Get all admin logs with pagination and filters
   */
  async getAdminLogs(params?: {
    page?: number;
    limit?: number;
    admin_id?: string;
    action?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: AdminLog[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.admin_id) queryParams.append('admin_id', params.admin_id);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.resource_type) queryParams.append('resource_type', params.resource_type);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const url = `/admin-logs?${queryParams.toString()}`;
    return await apiClient.getPaginated<AdminLog[]>(url);
  }

  /**
   * Get log by ID
   */
  async getAdminLogById(id: number): Promise<AdminLog> {
    return await apiClient.get<AdminLog>(`/admin-logs/${id}`);
  }

  /**
   * Get admin activity stats
   */
  async getAdminLogStats(days?: number): Promise<unknown> {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());
    
    const url = `/admin-logs/stats?${queryParams.toString()}`;
    return await apiClient.get(url);
  }
}

export default new AdminLogService();
