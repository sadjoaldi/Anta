/**
 * Stats Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';

export interface DashboardStats {
  users: {
    total: number;
    new_today: number;
    new_week: number;
    new_month: number;
    active_7days: number;
    retention_rate: number;
    by_role: {
      passengers: number;
      drivers: number;
      admins: number;
    };
  };
  drivers: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    online: number;
    average_rating: string;
  };
  trips: {
    total_trips: number;
    trips_today: number;
    trips_week: number;
    completed_trips: number;
    cancelled_trips: number;
    completion_rate: number;
  };
  revenue: {
    total_revenue: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
  };
}

class StatsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await apiClient.get<DashboardStats>('/stats/dashboard');
  }
}

export default new StatsService();
