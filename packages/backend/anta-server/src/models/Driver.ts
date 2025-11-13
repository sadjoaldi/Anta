import { BaseModel } from './BaseModel.js';
import { Driver, DriverInsert, DriverUpdate, DriverStatus } from './types.js';

export class DriverModel extends BaseModel<Driver, DriverInsert, DriverUpdate> {
  constructor() {
    super('drivers');
  }
  /**
   * Find driver by user_id
   */
  async findByUserId(userId: number): Promise<Driver | undefined> {
    return this.findOne({ user_id: userId });
  }

  /**
   * Get drivers by status
   */
  async getByStatus(status: DriverStatus, limit?: number, offset?: number): Promise<Driver[]> {
    return this.findAll({ status }, limit, offset);
  }

  /**
   * Get online drivers
   */
  async getOnlineDrivers(limit?: number, offset?: number): Promise<Driver[]> {
    return this.getByStatus('online', limit, offset);
  }

  /**
   * Get available drivers (online and not busy)
   */
  async getAvailableDrivers(limit?: number, offset?: number): Promise<Driver[]> {
    return this.getByStatus('online', limit, offset);
  }

  /**
   * Update driver status
   */
  async updateStatus(id: number, status: DriverStatus): Promise<number> {
    return this.updateById(id, { status });
  }

  /**
   * Update driver rating
   */
  async updateRating(id: number, newRating: number, totalTrips: number): Promise<number> {
    return this.updateById(id, {
      rating_avg: newRating,
      total_trips: totalTrips
    });
  }

  /**
   * Increment total trips
   */
  async incrementTrips(id: number): Promise<void> {
    await this.db.raw('UPDATE drivers SET total_trips = total_trips + 1 WHERE id = ?', [id]);
  }

  /**
   * Get drivers with details (join with users and vehicles)
   */
  async getDriversWithDetails(limit?: number, offset?: number) {
    let query = this.db('drivers')
      .select(
        'drivers.*',
        this.db.raw(`JSON_OBJECT(
          'id', users.id,
          'name', users.name,
          'phone', users.phone,
          'email', users.email,
          'role', users.role,
          'is_active', users.is_active
        ) as user`)
      )
      .leftJoin('users', 'drivers.user_id', 'users.id');

    if (limit) query = query.limit(limit);
    if (offset) query = query.offset(offset);

    const results = await query;
    
    // Parse JSON_OBJECT result
    return results.map((row: any) => ({
      ...row,
      user: typeof row.user === 'string' ? JSON.parse(row.user) : row.user
    }));
  }

  /**
   * Get drivers by KYC status
   */
  async getByKycStatus(kycStatus: 'pending' | 'approved' | 'rejected', limit?: number, offset?: number): Promise<Driver[]> {
    return this.findAll({ kyc_status: kycStatus }, limit, offset);
  }

  /**
   * Get pending KYC drivers (with user details)
   */
  async getPendingKycDrivers(limit?: number, offset?: number) {
    let query = this.db('drivers')
      .select(
        'drivers.*',
        'users.name as user_name',
        'users.phone as user_phone',
        'users.email as user_email',
        'users.created_at as user_created_at'
      )
      .leftJoin('users', 'drivers.user_id', 'users.id')
      .where('drivers.kyc_status', 'pending')
      .orderBy('drivers.created_at', 'desc');

    if (limit) query = query.limit(limit);
    if (offset) query = query.offset(offset);

    return query;
  }

  /**
   * Approve driver KYC
   */
  async approveKyc(id: number, adminId: number): Promise<number> {
    return this.db(this.tableName)
      .where({ id })
      .update({ 
        kyc_status: 'approved',
        kyc_approved_at: this.db.fn.now() as any,
        kyc_approved_by: adminId,
        kyc_rejection_reason: null,
        kyc_rejected_at: null
      } as any);
  }

  /**
   * Reject driver KYC
   */
  async rejectKyc(id: number, adminId: number, reason?: string): Promise<number> {
    return this.db(this.tableName)
      .where({ id })
      .update({ 
        kyc_status: 'rejected',
        kyc_rejected_at: this.db.fn.now() as any,
        kyc_approved_by: adminId,
        kyc_rejection_reason: reason || 'Aucune raison fournie',
        kyc_approved_at: null
      } as any);
  }

  /**
   * Update driver KYC documents
   */
  async updateKycDocuments(id: number, documents: any): Promise<number> {
    return this.updateById(id, { 
      kyc_documents: JSON.stringify(documents)
    });
  }

  /**
   * Update KYC status
   */
  async updateKycStatus(id: number, kycStatus: 'pending' | 'approved' | 'rejected'): Promise<number> {
    return this.updateById(id, { kyc_status: kycStatus });
  }

  /**
   * Get available drivers near a location using Haversine formula
   * @param latitude User latitude
   * @param longitude User longitude
   * @param radiusMeters Search radius in meters (default 5000m = 5km)
   */
  async getAvailableNearby(latitude: number, longitude: number, radiusMeters: number = 5000) {
    // Haversine formula to calculate distance
    const query = this.db('drivers')
      .select(
        'drivers.*',
        this.db.raw(`JSON_OBJECT(
          'id', users.id,
          'name', users.name,
          'phone', users.phone
        ) as user`),
        this.db.raw(`
          (6371000 * acos(
            cos(radians(?)) * cos(radians(current_latitude)) *
            cos(radians(current_longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(current_latitude))
          )) as distance
        `, [latitude, longitude, latitude])
      )
      .leftJoin('users', 'drivers.user_id', 'users.id')
      .where('drivers.status', 'online')
      .whereNotNull('drivers.current_latitude')
      .whereNotNull('drivers.current_longitude')
      .havingRaw('distance <= ?', [radiusMeters])
      .orderBy('distance', 'asc');

    const results = await query;
    
    // Parse JSON_OBJECT result and format distance
    return results.map((row: any) => ({
      ...row,
      user: typeof row.user === 'string' ? JSON.parse(row.user) : row.user,
      distance: Math.round(row.distance) // Distance in meters
    }));
  }

  /**
   * Update driver location
   */
  async updateLocation(id: number, latitude: number, longitude: number): Promise<number> {
    return await this.db(this.tableName)
      .where({ id })
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: this.db.fn.now()
      });
  }
}

// Export singleton instance
export default new DriverModel();
