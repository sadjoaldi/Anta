# Models Documentation

Ce dossier contient les modèles TypeScript pour interagir avec la base de données MySQL via Knex.

## Structure

- **`types.ts`**: Définitions TypeScript pour toutes les tables et types ENUM
- **`BaseModel.ts`**: Classe de base avec opérations CRUD génériques
- **Modèles spécifiques**: Classes étendant BaseModel avec méthodes métier

## Utilisation

### Import des modèles

```typescript
import { User, Trip, Driver, Payment } from './models/index.js';
```

### Opérations CRUD de base

```typescript
// Create
const userId = await User.create({
  phone: '+224123456789',
  name: 'John Doe',
  password_hash: 'hashed_password',
  is_active: true
});

// Read
const user = await User.findById(userId);
const userByPhone = await User.findByPhone('+224123456789');

// Update
await User.updateById(userId, { name: 'Jane Doe' });

// Delete
await User.deleteById(userId);

// Find multiple
const activeUsers = await User.getActiveUsers(10, 0); // limit 10, offset 0
```

### Opérations métier spécifiques

#### Users
```typescript
// Check if phone exists
const exists = await User.phoneExists('+224123456789');

// Get active users
const users = await User.getActiveUsers(20, 0);
```

#### Trips
```typescript
// Get passenger's trips
const trips = await Trip.getByPassenger(passengerId);

// Get driver's active trip
const activeTrip = await Trip.getDriverActiveTrip(driverId);

// Assign driver to trip
await Trip.assignDriver(tripId, driverId, vehicleId);

// Complete trip
await Trip.completeTrip(tripId, finalPrice);

// Cancel trip
await Trip.cancelTrip(tripId, 'Passenger cancelled');

// Get trip with full details
const tripDetails = await Trip.getTripWithDetails(tripId);
```

#### Drivers
```typescript
// Get online drivers
const onlineDrivers = await Driver.getOnlineDrivers();

// Update driver status
await Driver.updateStatus(driverId, 'online');

// Get drivers with details (joined data)
const driversWithDetails = await Driver.getDriversWithDetails(10, 0);
```

#### Payments
```typescript
// Get payments for a trip
const payments = await Payment.getByTrip(tripId);

// Update payment status
await Payment.updateStatus(paymentId, 'paid', 'provider_ref_123');

// Get total revenue
const revenue = await Payment.getTotalRevenue();
```

#### Ratings
```typescript
// Create rating
await Rating.create({
  trip_id: tripId,
  from_user_id: passengerId,
  to_user_id: driverId,
  rating: 5,
  comment: 'Excellent service!'
});

// Get average rating
const avgRating = await Rating.getAverageRating(driverId);

// Get rating statistics
const stats = await Rating.getRatingStats(driverId);
// Returns: { average: 4.5, total: 100, distribution: { 5: 60, 4: 30, ... } }
```

#### Wallets
```typescript
// Get or create wallet
const wallet = await Wallet.getOrCreate('user', userId);

// Add funds
await Wallet.addFunds('user', userId, 10000); // 100.00 EUR in cents

// Deduct funds
const success = await Wallet.deductFunds('user', userId, 5000);

// Transfer between wallets
await Wallet.transfer('user', userId, 'driver', driverId, 5000);
```

#### Driver Location
```typescript
// Update driver location
await DriverLocation.updateLocation(driverId, 9.5092, -13.7122);

// Get nearby drivers (within 5km)
const nearby = await DriverLocation.getNearbyDrivers(9.5092, -13.7122, 5000);

// Get active locations (updated in last 5 minutes)
const activeLocations = await DriverLocation.getActiveLocations(5);
```

#### Zones
```typescript
// Get zone
const zone = await Zone.findByName('Conakry Centre');

// Calculate trip price
const price = Zone.calculatePrice(zone, 5000, 600); // 5km, 10min

// Update surge multiplier
await Zone.updateSurge(zoneId, 1.5);
```

#### Promo Codes
```typescript
// Validate promo code
const isValid = await PromoCode.isValid('WELCOME2024');

// Get promo code
const promo = await PromoCode.findByCode('WELCOME2024');

// Calculate discount
const discount = PromoCode.calculateDiscount(promo, 10000);

// Apply promo code (decrement usage)
await PromoCode.applyPromoCode('WELCOME2024');
```

#### Sessions
```typescript
// Create session
const sessionId = await Session.create({
  user_id: userId,
  token_hash: 'hashed_token',
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});

// Validate session
const isValid = await Session.isValid('hashed_token');

// Get active sessions
const sessions = await Session.getActiveSessions(userId);

// Delete expired sessions
await Session.deleteExpired();
```

## Transactions

Pour les opérations nécessitant des transactions:

```typescript
import db from './db.js';

const trx = await db.transaction();

try {
  // Create trip
  const [tripId] = await trx('trips').insert({
    passenger_id: passengerId,
    // ... other fields
  });

  // Create payment
  await trx('payments').insert({
    trip_id: tripId,
    amount: 5000,
    // ... other fields
  });

  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## Types disponibles

Tous les types sont exportés depuis `types.ts`:

- `User`, `UserInsert`, `UserUpdate`
- `Driver`, `DriverInsert`, `DriverUpdate`
- `Trip`, `TripInsert`, `TripUpdate`
- `Vehicle`, `VehicleInsert`, `VehicleUpdate`
- `Payment`, `PaymentInsert`
- `Rating`, `RatingInsert`
- `Wallet`, `Session`, `Zone`, `PromoCode`, etc.

## Enums

```typescript
import { TripStatus, PaymentStatus, DriverStatus } from './models/types.js';

const status: TripStatus = 'in_progress';
const paymentStatus: PaymentStatus = 'paid';
const driverStatus: DriverStatus = 'online';
```
