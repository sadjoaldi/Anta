import { BaseModel } from './BaseModel.js';
import { DriverLocationLive } from './types.js';

export class DriverLocationModel extends BaseModel<DriverLocationLive, Partial<DriverLocationLive>, Partial<DriverLocationLive>> {
  constructor() {
    super('driver_location_live');
  }

  /**
   * Update driver location (upsert)
   */
  async updateLocation(driverId: number, lat: number, lng: number): Promise<void> {
    await this.db.raw(
      `INSERT INTO driver_location_live (driver_id, lat, lng, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE lat = ?, lng = ?, updated_at = NOW()`,
      [driverId, lat, lng, lat, lng]
    );
  }

  /**
   * Get driver location
   */
  async getLocation(driverId: number): Promise<DriverLocationLive | undefined> {
    return this.findById(driverId);
  }

  /**
   * Get nearby drivers within radius (in meters)
   */
  async getNearbyDrivers(lat: number, lng: number, radiusMeters: number, limit = 10) {
    // Haversine formula for distance calculation
    // 6371000 = Earth's radius in meters
    const query = `
      SELECT 
        driver_id,
        lat,
        lng,
        updated_at,
        (6371000 * acos(
          cos(radians(?)) * cos(radians(lat)) * 
          cos(radians(lng) - radians(?)) + 
          sin(radians(?)) * sin(radians(lat))
        )) AS distance
      FROM driver_location_live
      HAVING distance < ?
      ORDER BY distance
      LIMIT ?
    `;
    
    return this.db.raw(query, [lat, lng, lat, radiusMeters, limit]);
  }

  /**
   * Get all active driver locations (updated in last N minutes)
   */
  async getActiveLocations(minutesThreshold = 5): Promise<DriverLocationLive[]> {
    const thresholdDate = new Date(Date.now() - minutesThreshold * 60 * 1000);
    return this.db('driver_location_live')
      .where('updated_at', '>', thresholdDate);
  }

  /**
   * Delete stale locations (older than N minutes)
   */
  async deleteStaleLocations(minutesThreshold = 30): Promise<number> {
    const thresholdDate = new Date(Date.now() - minutesThreshold * 60 * 1000);
    return this.db('driver_location_live')
      .where('updated_at', '<', thresholdDate)
      .delete();
  }

  /**
   * Get drivers within a bounding box
   */
  async getDriversInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    return this.db('driver_location_live')
      .whereBetween('lat', [minLat, maxLat])
      .whereBetween('lng', [minLng, maxLng]);
  }
}

// Export singleton instance
export default new DriverLocationModel();
