import { Knex } from 'knex';
import db from '../db.js';

  /**
   * Base model class providing common CRUD operations
   */
 export class BaseModel<
  TRow extends { id: number | string },
  TInsert = Partial<TRow>,
  TUpdate = Partial<TRow>
 > {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  protected query() {
    return this.db<TRow>(this.tableName);
  }

  /** Find a record by ID */
  async findById(id: number | string): Promise<TRow | undefined> {
    return (await this.query().where('id', id).first()) as unknown as TRow | undefined;
  }

  /**
   * Find all records matching criteria
   */
  async findAll(
    where?: Partial<TRow>,
    limit?: number,
    offset?: number
  ): Promise<TRow[]> {
    let query = this.query();

    if (where) {
      query = query.where(where as Partial<TRow>);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return (await query) as unknown as TRow[];
  }

  /**
   * Find one record matching criteria
   */
  async findOne(where: Partial<TRow>): Promise<TRow | undefined> {
    return (await this.query().where(where as Partial<TRow>).first()) as unknown as TRow | undefined;
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<number> {
    const inserted = await (this.query() as any).insert(data);
    if (Array.isArray(inserted)) {
      const first = inserted[0] as unknown as number | string;
      return Number(first);
    }
    return Number((inserted as unknown) as number | string);
  }

  /**
   * Create multiple records
   */
  async createMany(data: TInsert[]): Promise<number[]> {
    const res = await (this.query() as any).insert(data);
    if (Array.isArray(res)) {
      return (res as unknown as Array<number | string>).map((v) => Number(v));
    }
    return [Number((res as unknown) as number | string)];
  }

  /**
   * Update a record by ID
   */
  async updateById(id: number | string, data: TUpdate): Promise<number> {
    const affected = await (this.query() as any)
      .where('id', id)
      .update(data);
    return Number((affected as unknown) as number | string);
  }

  /**
   * Update records matching criteria
   */
  async update(where: Partial<TRow>, data: TUpdate): Promise<number> {
    const affected = await (this.query() as any)
      .where(where as Partial<TRow>)
      .update(data);
    return Number((affected as unknown) as number | string);
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: number | string): Promise<number> {
    const affected = await this.query().where('id', id).delete();
    return Number((affected as unknown) as number | string);
  }

  /**
   * Delete records matching criteria
   */
  async delete(where: Partial<TRow>): Promise<number> {
    const affected = await this.query().where(where as Partial<TRow>).delete();
    return Number((affected as unknown) as number | string);
  }

  /**
   * Count records matching criteria
   */
  async count(where?: Partial<TRow>): Promise<number> {
    const q = where ? this.query().where(where as Partial<TRow>) : this.query();
    const result = await q.count<{ count: string | number }[]>('* as count').first();
    return result ? Number(result.count) : 0;
  }

  /**
   * Check if a record exists
   */
  async exists(where: Partial<TRow>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}
