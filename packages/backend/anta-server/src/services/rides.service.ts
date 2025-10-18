/**
 * Rides Service
 * Manages ride creation, status updates, and tracking
 */

import knex from '../utils/knex.js';

export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateRideDto {
  passengerId: number;
  driverId: number;
  originLat: number;
  originLng: number;
  originAddress: string;
  destLat: number;
  destLng: number;
  destAddress: string;
  distance: number; // meters
  duration: number; // seconds
  estimatedPrice: number;
  vehicleType: string;
  passengers: number;
  notes?: string;
}

export interface Ride {
  id: number;
  passenger_id: number;
  driver_id: number;
  origin_lat: number;
  origin_lng: number;
  origin_address: string;
  dest_lat: number;
  dest_lng: number;
  dest_address: string;
  distance: number;
  duration: number;
  estimated_price: number;
  final_price?: number;
  vehicle_type: string;
  passengers: number;
  notes?: string;
  status: RideStatus;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

class RidesService {
  /**
   * Create a new ride request
   */
  async createRide(data: CreateRideDto): Promise<Ride> {
    try {
      // Check if driver exists and is online
      const driver = await knex('drivers')
        .where({ id: data.driverId })
        .whereIn('status', ['online', 'busy'])
        .first();

      if (!driver) {
        throw new Error('Driver not found or not available');
      }

      // Create ride
      const [rideId] = await knex('rides').insert({
        passenger_id: data.passengerId,
        driver_id: data.driverId,
        origin_lat: data.originLat,
        origin_lng: data.originLng,
        origin_address: data.originAddress,
        dest_lat: data.destLat,
        dest_lng: data.destLng,
        dest_address: data.destAddress,
        distance: data.distance,
        duration: data.duration,
        estimated_price: data.estimatedPrice,
        vehicle_type: data.vehicleType,
        passengers: data.passengers,
        notes: data.notes,
        status: RideStatus.PENDING,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

      // Get the created ride with driver info
      const ride = await this.getRideById(rideId);

      console.log(`Ride created: #${rideId} - ${data.originAddress} → ${data.destAddress}`);

      // TODO: Send notification to driver
      // await notificationsService.notifyDriver(data.driverId, {
      //   type: 'NEW_RIDE_REQUEST',
      //   rideId,
      // });

      return ride;
    } catch (error: any) {
      console.error('Error creating ride:', error);
      throw new Error('Failed to create ride: ' + error.message);
    }
  }

  /**
   * Get ride by ID with driver and passenger info
   */
  async getRideById(rideId: number): Promise<Ride> {
    const ride = await knex('rides')
      .where({ 'rides.id': rideId })
      .first();

    if (!ride) {
      throw new Error('Ride not found');
    }

    return ride;
  }

  /**
   * Update ride status
   */
  async updateRideStatus(
    rideId: number,
    status: RideStatus,
    additionalData?: Partial<Ride>
  ): Promise<Ride> {
    try {
      const updateData: any = {
        status,
        updated_at: knex.fn.now(),
      };

      // Add timestamps based on status
      if (status === RideStatus.STARTED) {
        updateData.started_at = knex.fn.now();
      } else if (status === RideStatus.COMPLETED) {
        updateData.completed_at = knex.fn.now();
      }

      // Merge additional data
      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      await knex('rides')
        .where({ id: rideId })
        .update(updateData);

      // Get updated ride
      const ride = await this.getRideById(rideId);

      console.log(`Ride #${rideId} status updated: ${status}`);

      // TODO: Send notifications
      // if (status === RideStatus.ACCEPTED) {
      //   await notificationsService.notifyPassenger(ride.passenger_id, {
      //     type: 'RIDE_ACCEPTED',
      //     rideId,
      //   });
      // }

      return ride;
    } catch (error: any) {
      console.error('Error updating ride status:', error);
      throw new Error('Failed to update ride status: ' + error.message);
    }
  }

  /**
   * Accept ride (driver)
   */
  async acceptRide(rideId: number, driverId: number): Promise<Ride> {
    // Verify the ride belongs to this driver
    const ride = await knex('rides')
      .where({ id: rideId, driver_id: driverId, status: RideStatus.PENDING })
      .first();

    if (!ride) {
      throw new Error('Ride not found or already accepted/cancelled');
    }

    return this.updateRideStatus(rideId, RideStatus.ACCEPTED);
  }

  /**
   * Start ride (driver)
   */
  async startRide(rideId: number, driverId: number): Promise<Ride> {
    const ride = await knex('rides')
      .where({ id: rideId, driver_id: driverId, status: RideStatus.ACCEPTED })
      .first();

    if (!ride) {
      throw new Error('Ride not found or not in accepted state');
    }

    return this.updateRideStatus(rideId, RideStatus.STARTED);
  }

  /**
   * Complete ride (driver)
   */
  async completeRide(
    rideId: number,
    driverId: number,
    finalPrice?: number
  ): Promise<Ride> {
    const ride = await knex('rides')
      .where({ id: rideId, driver_id: driverId, status: RideStatus.STARTED })
      .first();

    if (!ride) {
      throw new Error('Ride not found or not in started state');
    }

    const additionalData: Partial<Ride> = {};
    if (finalPrice) {
      additionalData.final_price = finalPrice;
    }

    return this.updateRideStatus(rideId, RideStatus.COMPLETED, additionalData);
  }

  /**
   * Cancel ride
   */
  async cancelRide(
    rideId: number,
    userId: number,
    userType: 'passenger' | 'driver'
  ): Promise<Ride> {
    const whereClause: any = { id: rideId };
    
    if (userType === 'passenger') {
      whereClause.passenger_id = userId;
    } else {
      whereClause.driver_id = userId;
    }

    const ride = await knex('rides')
      .where(whereClause)
      .whereIn('status', [RideStatus.PENDING, RideStatus.ACCEPTED])
      .first();

    if (!ride) {
      throw new Error('Ride not found or cannot be cancelled');
    }

    return this.updateRideStatus(rideId, RideStatus.CANCELLED);
  }

  /**
   * Get pending rides for a driver
   */
  async getDriverPendingRides(driverId: number): Promise<Ride[]> {
    const rides = await knex('rides')
      .where({ driver_id: driverId, status: RideStatus.PENDING })
      .orderBy('created_at', 'desc');

    return rides;
  }

  /**
   * Get passenger ride history
   */
  async getPassengerRides(
    passengerId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Ride[]> {
    const rides = await knex('rides')
      .where({ passenger_id: passengerId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return rides;
  }

  /**
   * Get driver ride history
   */
  async getDriverRides(
    driverId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Ride[]> {
    const rides = await knex('rides')
      .where({ driver_id: driverId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return rides;
  }

  /**
   * Get active ride for passenger
   */
  async getActivePassengerRide(passengerId: number): Promise<Ride | null> {
    const ride = await knex('rides')
      .where({ passenger_id: passengerId })
      .whereIn('status', [RideStatus.PENDING, RideStatus.ACCEPTED, RideStatus.STARTED])
      .orderBy('created_at', 'desc')
      .first();

    return ride || null;
  }

  /**
   * Get active ride for driver
   */
  async getActiveDriverRide(driverId: number): Promise<Ride | null> {
    const ride = await knex('rides')
      .where({ driver_id: driverId })
      .whereIn('status', [RideStatus.ACCEPTED, RideStatus.STARTED])
      .orderBy('created_at', 'desc')
      .first();

    return ride || null;
  }
}

export default new RidesService();
