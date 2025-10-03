import { BaseModel } from './BaseModel.js';
import { Vehicle, VehicleInsert, VehicleUpdate, VehicleType, VehicleStatus } from './types.js';

export class VehicleModel extends BaseModel<Vehicle, VehicleInsert, VehicleUpdate> {
  constructor() {
    super('vehicles');
  }

  /**
   * Find vehicle by driver_id
   */
  async findByDriverId(driverId: number): Promise<Vehicle | undefined> {
    return this.findOne({ driver_id: driverId });
  }

  /**
   * Get vehicles by type
   */
  async getByType(type: VehicleType, limit?: number, offset?: number): Promise<Vehicle[]> {
    return this.findAll({ type }, limit, offset);
  }

  /**
   * Get active vehicles
   */
  async getActiveVehicles(limit?: number, offset?: number): Promise<Vehicle[]> {
    return this.findAll({ status: 'active' }, limit, offset);
  }

  /**
   * Update vehicle status
   */
  async updateStatus(id: number, status: VehicleStatus): Promise<number> {
    return this.updateById(id, { status });
  }
}

// Export singleton instance
export default new VehicleModel();
