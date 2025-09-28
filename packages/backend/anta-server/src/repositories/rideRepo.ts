import knex from '../utils/knex';

export interface Ride {
  id: number;
  rider_id: number;
  driver_id?: number | null;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  status: 'requested' | 'assigned' | 'ongoing' | 'completed' | 'cancelled';
  price?: number | null;
  created_at: string;
  updated_at: string;
}

const TABLE = 'rides';

async function create(data: Partial<Ride>): Promise<Ride> {
  const [row] = await knex<Ride>(TABLE).insert(data).returning('*');
  if (!row) {
    const idRow = await knex(TABLE).max<{ max: number }>('id as max').first();
    return (await knex<Ride>(TABLE).where({ id: idRow?.max || 0 }).first()) as Ride;
  }
  return row as Ride;
}

async function findById(id: number): Promise<Ride | undefined> {
  return knex<Ride>(TABLE).where({ id }).first();
}

export default { create, findById };
