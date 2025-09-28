import knex from '../utils/knex';

export interface Driver {
  id: number;
  user_id: number;
  vehicle_plate?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  is_available: number; // 1/0 for sqlite boolean
  created_at: string;
  updated_at: string;
}

const TABLE = 'drivers';

async function listAvailable(): Promise<Driver[]> {
  return knex<Driver>(TABLE).where({ is_available: 1 }).select('*');
}

async function upsertForUser(userId: number, vehiclePlate?: string): Promise<Driver> {
  const existing = await knex<Driver>(TABLE).where({ user_id: userId }).first();
  if (existing) {
    if (vehiclePlate && vehiclePlate !== existing.vehicle_plate) {
      await knex<Driver>(TABLE)
        .where({ id: existing.id })
        .update({ vehicle_plate: vehiclePlate, updated_at: knex.fn.now() });
      return { ...existing, vehicle_plate: vehiclePlate } as Driver;
    }
    return existing;
  }
  const insertData: Partial<Driver> = {
    user_id: userId,
    vehicle_plate: vehiclePlate || null,
    is_available: 1
  };
  const [row] = await knex<Driver>(TABLE).insert(insertData).returning('*');
  if (!row) {
    const idRow = await knex(TABLE).max<{ max: number }>('id as max').first();
    return (await knex<Driver>(TABLE).where({ id: idRow?.max || 0 }).first()) as Driver;
  }
  return row as Driver;
}

async function updateLocation(userId: number, lat: number, lng: number): Promise<number> {
  return knex<Driver>(TABLE)
    .where({ user_id: userId })
    .update({ location_lat: lat, location_lng: lng, updated_at: knex.fn.now() });
}

async function setAvailability(userId: number, available: boolean): Promise<number> {
  return knex<Driver>(TABLE)
    .where({ user_id: userId })
    .update({ is_available: available ? 1 : 0, updated_at: knex.fn.now() });
}

async function findNearby(lat: number, lng: number, radiusKm = 5): Promise<Driver[]> {
  // Simple bounding box filtering for SQLite (no trig functions required)
  const deltaLat = radiusKm / 111; // ~111km per degree latitude
  const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const minLat = lat - deltaLat;
  const maxLat = lat + deltaLat;
  const minLng = lng - deltaLng;
  const maxLng = lng + deltaLng;

  // Order by approximate squared distance
  const distanceExpr = knex.raw(
    '( (location_lat - ?) * (location_lat - ?) + (location_lng - ?) * (location_lng - ?) )',
    [lat, lat, lng, lng]
  );

  return knex<Driver>(TABLE)
    .where({ is_available: 1 })
    .andWhereBetween('location_lat', [minLat, maxLat])
    .andWhereBetween('location_lng', [minLng, maxLng])
    .orderBy(distanceExpr as any)
    .limit(50);
}

export default { listAvailable, upsertForUser, updateLocation, setAvailability, findNearby };
