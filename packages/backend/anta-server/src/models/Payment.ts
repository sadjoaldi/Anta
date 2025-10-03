import { BaseModel } from './BaseModel.js';
import { Payment, PaymentInsert, PaymentStatus } from './types.js';

export class PaymentModel extends BaseModel<Payment, PaymentInsert, Partial<Payment>> {
  constructor() {
    super('payments');
  }

  /**
   * Get payments by trip
   */
  async getByTrip(tripId: number): Promise<Payment[]> {
    return this.findAll({ trip_id: tripId });
  }

  /**
   * Get payments by status
   */
  async getByStatus(status: PaymentStatus, limit?: number, offset?: number): Promise<Payment[]> {
    return this.findAll({ status }, limit, offset);
  }

  /**
   * Update payment status
   */
  async updateStatus(id: number, status: PaymentStatus, providerRef?: string): Promise<number> {
    const update: Partial<Payment> = { status };
    if (providerRef) {
      update.provider_ref = providerRef;
    }
    return this.updateById(id, update);
  }

  /**
   * Get total revenue (paid payments)
   */
  async getTotalRevenue(): Promise<number> {
    const result = await this.db('payments')
      .sum('amount as total')
      .where('status', 'paid')
      .first();
    return result?.total || 0;
  }

  /**
   * Get revenue by date range
   */
  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.db('payments')
      .sum('amount as total')
      .where('status', 'paid')
      .whereBetween('created_at', [startDate, endDate])
      .first();
    return result?.total || 0;
  }
}

// Export singleton instance
export default new PaymentModel();
