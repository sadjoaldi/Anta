import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('rides');
  if (!exists) {
    await knex.schema.createTable('rides', (t) => {
      t.increments('id').primary();
      t.integer('rider_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.integer('driver_id').references('id').inTable('users').onDelete('SET NULL');
      t.float('pickup_lat').notNullable();
      t.float('pickup_lng').notNullable();
      t.float('dropoff_lat').notNullable();
      t.float('dropoff_lng').notNullable();
      t.enu('status', ['requested', 'assigned', 'ongoing', 'completed', 'cancelled']).notNullable().defaultTo('requested');
      t.float('price');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rides');
}
