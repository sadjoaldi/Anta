/**
 * Payment Service for ANTA Admin Dashboard
 */

import apiClient from './api.client';
import type { Payment, PaymentWithTrip } from '../types/api.types';

class PaymentService {
  /**
   * Get all payments with pagination and filters
   */
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: PaymentWithTrip[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const url = `/payments?${queryParams.toString()}`;
    return await apiClient.getPaginated<PaymentWithTrip[]>(url);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: number): Promise<Payment> {
    return await apiClient.get<Payment>(`/payments/${id}`);
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(
    status: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: PaymentWithTrip[]; pagination: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/payments/status/${status}?${queryParams.toString()}`;
    return await apiClient.getPaginated<PaymentWithTrip[]>(url);
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(): Promise<{ total: number; currency: string }> {
    return await apiClient.get<{ total: number; currency: string }>('/payments/revenue/total');
  }

  /**
   * Get revenue by date range
   */
  async getRevenueByDateRange(params: {
    date_from: string;
    date_to: string;
  }): Promise<{ total: number; currency: string; breakdown: unknown[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('date_from', params.date_from);
    queryParams.append('date_to', params.date_to);

    const url = `/payments/revenue/range?${queryParams.toString()}`;
    return await apiClient.get(url);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: number,
    status: string
  ): Promise<Payment> {
    return await apiClient.patch<Payment>(`/payments/${paymentId}/status`, {
      status,
    });
  }

  /**
   * Delete payment (admin only)
   */
  async deletePayment(paymentId: number): Promise<void> {
    return await apiClient.delete(`/payments/${paymentId}`);
  }
}

export default new PaymentService();
