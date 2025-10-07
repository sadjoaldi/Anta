/**
 * Driver Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { Driver, DriverWithUser } from '../types/api.types';

class DriverService {
  /**
   * Get all drivers with pagination
   */
  async getDrivers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    kyc_status?: string;
  }): Promise<{ data: DriverWithUser[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.kyc_status) queryParams.append('kyc_status', params.kyc_status);

    const url = `/drivers/details?${queryParams.toString()}`;
    return await apiClient.getPaginated<DriverWithUser[]>(url);
  }

  /**
   * Get drivers pending KYC approval
   */
  async getPendingKyc(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: DriverWithUser[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/drivers/kyc/pending?${queryParams.toString()}`;
    return await apiClient.getPaginated<DriverWithUser[]>(url);
  }

  /**
   * Get driver by ID
   */
  async getDriverById(id: number): Promise<Driver> {
    return await apiClient.get<Driver>(`/drivers/${id}`);
  }

  /**
   * Approve driver KYC
   */
  async approveKyc(driverId: number): Promise<Driver> {
    return await apiClient.patch<Driver>(`/drivers/${driverId}/kyc/approve`);
  }

  /**
   * Reject driver KYC
   */
  async rejectKyc(driverId: number, reason?: string): Promise<Driver> {
    return await apiClient.patch<Driver>(`/drivers/${driverId}/kyc/reject`, {
      reason,
    });
  }

  /**
   * Update driver status
   */
  async updateStatus(
    driverId: number,
    status: 'offline' | 'online' | 'busy' | 'suspended'
  ): Promise<Driver> {
    return await apiClient.patch<Driver>(`/drivers/${driverId}/status`, {
      status,
    });
  }

  /**
   * Get driver statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    averageRating: number;
  }> {
    // This would need a dedicated endpoint in the backend
    // For now, we'll calculate from the drivers list
    const { data: drivers } = await this.getDrivers({ limit: 1000 });

    return {
      total: drivers.length,
      active: drivers.filter((d) => d.kyc_status === 'approved' && d.status !== 'suspended').length,
      pending: drivers.filter((d) => d.kyc_status === 'pending').length,
      suspended: drivers.filter((d) => d.status === 'suspended').length,
      averageRating:
        drivers.reduce((sum, d) => sum + d.rating_avg, 0) / drivers.length || 0,
    };
  }
}

export default new DriverService();
