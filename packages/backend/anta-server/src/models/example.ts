/**
 * Example usage of models
 * This file demonstrates common patterns and workflows
 */

import {
  User,
  Driver,
  Vehicle,
  Trip,
  Payment,
  Rating,
  Wallet,
  DriverLocation,
  Zone,
  PromoCode,
  Session
} from './index.js';

/**
 * Example 1: User Registration Flow
 */
export async function registerUser(phone: string, name: string, passwordHash: string) {
  // Check if phone already exists
  const exists = await User.phoneExists(phone);
  if (exists) {
    throw new Error('Phone number already registered');
  }

  // Create user
  const userId = await User.create({
    phone,
    name,
    password_hash: passwordHash,
    is_active: true
  });

  // Create wallet for user
  await Wallet.getOrCreate('user', userId);

  return userId;
}

/**
 * Example 2: Driver Registration Flow
 */
export async function registerDriver(
  userId: number,
  vehicleData: { type: string; model: string; color: string; capacity: number }
) {
  // Create driver profile
  const driverId = await Driver.create({
    user_id: userId,
    status: 'offline',
    kyc_status: 'pending',
    rating_avg: 0,
    total_trips: 0
  });

  // Create vehicle
  const vehicleId = await Vehicle.create({
    driver_id: driverId,
    type: vehicleData.type as any,
    model: vehicleData.model,
    color: vehicleData.color,
    capacity: vehicleData.capacity,
    status: 'pending'
  });

  // Link vehicle to driver
  await Driver.updateById(driverId, { vehicle_id: vehicleId });

  // Create wallet for driver
  await Wallet.getOrCreate('driver', driverId);

  return { driverId, vehicleId };
}

/**
 * Example 3: Create Trip Request
 */
export async function createTripRequest(
  passengerId: number,
  origin: { lat: number; lng: number; text: string },
  destination: { lat: number; lng: number; text: string },
  distanceM: number,
  durationS: number
) {
  // Get zone pricing (assuming Conakry for now)
  const zone = await Zone.findByName('Conakry Centre');
  if (!zone) {
    throw new Error('Zone not found');
  }

  // Calculate estimated price
  const estimatedPrice = Zone.calculatePrice(zone, distanceM, durationS);

  // Create trip
  const tripId = await Trip.create({
    passenger_id: passengerId,
    origin_lat: origin.lat,
    origin_lng: origin.lng,
    origin_text: origin.text,
    dest_lat: destination.lat,
    dest_lng: destination.lng,
    dest_text: destination.text,
    status: 'pending',
    price_estimated: estimatedPrice,
    distance_m: distanceM,
    duration_s: durationS,
    payment_status: 'pending'
  });

  return { tripId, estimatedPrice };
}

/**
 * Example 4: Find and Assign Nearby Driver
 */
export async function assignNearbyDriver(tripId: number, originLat: number, originLng: number) {
  // Get trip details
  const trip = await Trip.findById(tripId);
  if (!trip || trip.status !== 'pending') {
    throw new Error('Trip not available for assignment');
  }

  // Find nearby online drivers (within 5km)
  const nearbyLocations = await DriverLocation.getNearbyDrivers(originLat, originLng, 5000, 10);
  
  if (!nearbyLocations[0] || nearbyLocations[0].length === 0) {
    throw new Error('No drivers available nearby');
  }

  // Get first available driver
  const driverLocation = nearbyLocations[0][0];
  const driver = await Driver.findById(driverLocation.driver_id);
  
  if (!driver || driver.status !== 'online') {
    throw new Error('Driver not available');
  }

  // Assign driver to trip
  await Trip.assignDriver(tripId, driver.id, driver.vehicle_id || undefined);
  
  // Update driver status
  await Driver.updateStatus(driver.id, 'busy');

  return driver.id;
}

/**
 * Example 5: Complete Trip and Process Payment
 */
export async function completeTripWithPayment(
  tripId: number,
  finalPrice: number,
  paymentMethod: 'cash' | 'card' | 'wallet'
) {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Complete trip
  await Trip.completeTrip(tripId, finalPrice);

  // Create payment record
  const paymentId = await Payment.create({
    trip_id: tripId,
    amount: finalPrice,
    currency: 'GNF',
    method: paymentMethod,
    status: 'paid'
  });

  // If wallet payment, transfer funds
  if (paymentMethod === 'wallet' && trip.passenger_id && trip.driver_id) {
    const platformFee = Math.round(finalPrice * 0.2); // 20% platform fee
    const driverAmount = finalPrice - platformFee;

    // Transfer from passenger to driver
    await Wallet.transfer('user', trip.passenger_id, 'driver', trip.driver_id, driverAmount);
    
    // Transfer platform fee
    await Wallet.transfer('user', trip.passenger_id, 'platform', 1, platformFee);
  }

  // Update driver status back to online
  if (trip.driver_id) {
    await Driver.updateStatus(trip.driver_id, 'online');
    await Driver.incrementTrips(trip.driver_id);
  }

  return paymentId;
}

/**
 * Example 6: Rate Trip
 */
export async function rateTrip(
  tripId: number,
  fromUserId: number,
  toUserId: number,
  rating: number,
  comment?: string
) {
  // Check if already rated
  const hasRated = await Rating.hasRatedTrip(tripId, fromUserId);
  if (hasRated) {
    throw new Error('Trip already rated');
  }

  // Create rating
  await Rating.create({
    trip_id: tripId,
    from_user_id: fromUserId,
    to_user_id: toUserId,
    rating,
    comment
  });

  // Update driver's average rating if rating a driver
  const driver = await Driver.findByUserId(toUserId);
  if (driver) {
    const newAvg = await Rating.getAverageRating(toUserId);
    await Driver.updateById(driver.id, { rating_avg: newAvg });
  }
}

/**
 * Example 7: Apply Promo Code to Trip
 */
export async function applyPromoCodeToTrip(tripId: number, promoCode: string) {
  // Validate promo code
  const isValid = await PromoCode.isValid(promoCode);
  if (!isValid) {
    throw new Error('Invalid or expired promo code');
  }

  const promo = await PromoCode.findByCode(promoCode);
  if (!promo) {
    throw new Error('Promo code not found');
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Calculate discount
  const discount = PromoCode.calculateDiscount(promo, trip.price_estimated);
  const newPrice = trip.price_estimated - discount;

  // Update trip
  await Trip.updateById(tripId, {
    price_estimated: newPrice,
    payment_method: 'promo'
  });

  // Apply promo code (decrement usage)
  await PromoCode.applyPromoCode(promoCode);

  return { originalPrice: trip.price_estimated, discount, newPrice };
}

/**
 * Example 8: User Login and Session Management
 */
export async function loginUser(phone: string, passwordHash: string) {
  const user = await User.findByPhone(phone);
  if (!user || user.password_hash !== passwordHash) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is inactive');
  }

  // Create session (7 days expiry)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const tokenHash = 'generated_token_hash'; // Should be actual hash
  
  const sessionId = await Session.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  return { user, sessionId, tokenHash };
}

/**
 * Example 9: Update Driver Location (Real-time)
 */
export async function updateDriverLocationRealtime(driverId: number, lat: number, lng: number) {
  await DriverLocation.updateLocation(driverId, lat, lng);
}

/**
 * Example 10: Get Trip History with Details
 */
export async function getUserTripHistory(userId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const trips = await Trip.getTripHistory(userId, pageSize, offset);
  
  // Get detailed info for each trip
  const tripsWithDetails = await Promise.all(
    trips.map(trip => Trip.getTripWithDetails(trip.id))
  );

  return tripsWithDetails;
}
