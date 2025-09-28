import knex from '../utils/knex';

export type UserRole = 'rider' | 'driver' | 'admin';
export interface User {
  id: number;
  phone: string;
  name?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

const TABLE = 'users';

async function findById(id: number): Promise<User | undefined> {
  return knex<User>(TABLE).where({ id }).first();
}

async function findByPhone(phone: string): Promise<User | undefined> {
  return knex<User>(TABLE).where({ phone }).first();
}

async function create(data: Partial<User>): Promise<User> {
  const [row] = await knex<User>(TABLE).insert(data).returning('*');
  // SQLite returns number ids without returning('*'), fallback
  if (!row) {
    const id = await knex(TABLE).max<{ max: number }>('id as max').first();
    return (await findById(id?.max || 0)) as User;
  }
  return row as User;
}

export default { findById, findByPhone, create };
