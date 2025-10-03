import { BaseModel } from './BaseModel.js';
import { Zone } from './types.js';

export class ZoneModel extends BaseModel<Zone, Partial<Zone>, Partial<Zone>> {
  constructor() {
    super('zones');
  }

  /**
   * Find zone by name
   */
  async findByName(name: string): Promise<Zone | undefined> {
    return this.findOne({ name });
  }

  /**
   * Calculate trip price based on zone pricing
   */
  calculatePrice(zone: Zone, distanceMeters: number, durationSeconds: number): number {
    const distanceKm = distanceMeters / 1000;
    const durationMin = durationSeconds / 60;
    
    const baseFare = zone.base_fare;
    const distanceFare = distanceKm * zone.per_km;
    const timeFare = durationMin * zone.per_min;
    
    const subtotal = baseFare + distanceFare + timeFare;
    const total = Math.round(subtotal * zone.surge_multiplier);
    
    return total;
  }

  /**
   * Update surge multiplier for a zone
   */
  async updateSurge(zoneId: number, surgeMultiplier: number): Promise<number> {
    return this.updateById(zoneId, { surge_multiplier: surgeMultiplier });
  }

  /**
   * Get all active zones with current pricing
   */
  async getActiveZones(): Promise<Zone[]> {
    return this.findAll();
  }
}

// Export singleton instance
export default new ZoneModel();
