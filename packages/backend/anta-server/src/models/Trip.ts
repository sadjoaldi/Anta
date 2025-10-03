import { BaseModel } from './BaseModel.js';
import { Trip, TripInsert, TripUpdate, TripStatus } from './types.js';

export class TripModel extends BaseModel<Trip, TripInsert, TripUpdate> {
  constructor() {
    super('trips');
  }

  /**
   * Get trips by passenger
   */
  async getByPassenger(passengerId: number, limit?: number, offset?: number): Promise<Trip[]> {
    return this.findAll({ passenger_id: passengerId }, limit, offset);
  }

  /**
   * Get trips by driver
   */
  async getByDriver(driverId: number, limit?: number, offset?: number): Promise<Trip[]> {
    return this.findAll({ driver_id: driverId }, limit, offset);
  }

  /**
   * Get trips by status
   */
  async getByStatus(status: TripStatus, limit?: number, offset?: number): Promise<Trip[]> {
    return this.findAll({ status }, limit, offset);
  }

  /**
   * Get pending trips (waiting for driver assignment)
   */
  async getPendingTrips(limit?: number, offset?: number): Promise<Trip[]> {
    return this.getByStatus('pending', limit, offset);
  }

  /**
   * Get active trips (assigned or in progress)
   */
  async getActiveTrips(limit?: number, offset?: number): Promise<Trip[]> {
    return this.db('trips')
      .whereIn('status', ['assigned', 'in_progress'])
      .limit(limit || 100)
      .offset(offset || 0);
  }

  /**
   * Get driver's current active trip
   */
  async getDriverActiveTrip(driverId: number): Promise<Trip | undefined> {
    return this.db('trips')
      .where({ driver_id: driverId })
      .whereIn('status', ['assigned', 'in_progress'])
      .first();
  }

  /**
   * Get passenger's current active trip
   */
  async getPassengerActiveTrip(passengerId: number): Promise<Trip | undefined> {
    return this.db('trips')
      .where({ passenger_id: passengerId })
      .whereIn('status', ['pending', 'assigned', 'in_progress'])
      .first();
  }

  /**
   * Update trip status
   */
  async updateStatus(id: number, status: TripStatus): Promise<number> {
    const update: TripUpdate = { status };
    
    // Auto-set timestamps based on status
    if (status === 'in_progress' && !update.started_at) {
      update.started_at = new Date();
    } else if (status === 'completed' && !update.ended_at) {
      update.ended_at = new Date();
    } else if (status === 'cancelled' && !update.cancelled_at) {
      update.cancelled_at = new Date();
    }
    
    return this.updateById(id, update);
  }

  /**
   * Assign driver to trip
   */
  async assignDriver(tripId: number, driverId: number, vehicleId?: number): Promise<number> {
    return this.updateById(tripId, {
      driver_id: driverId,
      vehicle_id: vehicleId,
      status: 'assigned'
    });
  }

  /**
   * Complete trip with final price
   */
  async completeTrip(tripId: number, finalPrice: number): Promise<number> {
    return this.updateById(tripId, {
      status: 'completed',
      price_final: finalPrice,
      ended_at: new Date()
    });
  }

  /**
   * Cancel trip with reason
   */
  async cancelTrip(tripId: number, reason?: string): Promise<number> {
    return this.updateById(tripId, {
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date()
    });
  }

  /**
   * Get trip with full details (passenger, driver, vehicle)
   */
  async getTripWithDetails(tripId: number) {
    return this.db('trips')
      .select(
        'trips.*',
        'passengers.name as passenger_name',
        'passengers.phone as passenger_phone',
        'drivers.rating_avg as driver_rating',
        'driver_users.name as driver_name',
        'driver_users.phone as driver_phone',
        'vehicles.type as vehicle_type',
        'vehicles.model as vehicle_model',
        'vehicles.color as vehicle_color'
      )
      .leftJoin('users as passengers', 'trips.passenger_id', 'passengers.id')
      .leftJoin('drivers', 'trips.driver_id', 'drivers.id')
      .leftJoin('users as driver_users', 'drivers.user_id', 'driver_users.id')
      .leftJoin('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .where('trips.id', tripId)
      .first();
  }

  /**
   * Get trip history for user with pagination
   */
  async getTripHistory(userId: number, limit = 20, offset = 0) {
    const knexDb = this.db;
    return knexDb('trips')
      .select('trips.*')
      .where('passenger_id', userId)
      .orWhere(function() {
        this.whereIn('trips.driver_id', 
          knexDb('drivers').select('id').where('user_id', userId)
        );
      })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
}

// Export singleton instance
export default new TripModel();
