/**
 * Migration: Create rides table
 * Date: 2025-10-16
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rides', (table) => {
    table.bigIncrements('id').primary();
    
    // Passenger and Driver
    table.bigInteger('passenger_id').unsigned().notNullable();
    table.bigInteger('driver_id').unsigned().notNullable();
    
    // Origin
    table.decimal('origin_lat', 10, 7).notNullable();
    table.decimal('origin_lng', 10, 7).notNullable();
    table.string('origin_address', 255).notNullable();
    
    // Destination
    table.decimal('dest_lat', 10, 7).notNullable();
    table.decimal('dest_lng', 10, 7).notNullable();
    table.string('dest_address', 255).notNullable();
    
    // Trip details
    table.integer('distance').notNullable().comment('Distance in meters');
    table.integer('duration').notNullable().comment('Duration in seconds');
    table.integer('estimated_price').notNullable().comment('Estimated price in GNF');
    table.integer('final_price').nullable().comment('Final price in GNF');
    
    // Vehicle and passengers
    table.string('vehicle_type', 50).notNullable().defaultTo('moto');
    table.integer('passengers').notNullable().defaultTo(1);
    table.text('notes').nullable();
    
    // Status tracking
    table.enum('status', [
      'pending',
      'accepted',
      'started',
      'completed',
      'cancelled'
    ]).notNullable().defaultTo('pending');
    
    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    
    // Foreign keys
    table.foreign('passenger_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    
    // Indexes
    table.index('passenger_id');
    table.index('driver_id');
    table.index('status');
    table.index('created_at');
  });

  console.log('✅ Table "rides" created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rides');
  console.log('❌ Table "rides" dropped');
}
