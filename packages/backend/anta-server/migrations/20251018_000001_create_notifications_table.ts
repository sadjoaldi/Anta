/**
 * Migration: Create notifications table
 * Date: 2025-10-18
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.bigIncrements('id').primary();
    
    // User receiving the notification
    table.bigInteger('user_id').unsigned().notNullable();
    
    // Notification details
    table.enum('type', [
      'ride_accepted',
      'ride_started',
      'ride_completed',
      'ride_cancelled',
      'payment_confirmed',
      'driver_arrived',
      'promotion',
      'system'
    ]).notNullable();
    
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    
    // Optional reference to ride
    table.bigInteger('ride_id').unsigned().nullable();
    
    // Read status
    table.boolean('is_read').notNullable().defaultTo(false);
    
    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('read_at').nullable();
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('ride_id').references('id').inTable('rides').onDelete('SET NULL');
    
    // Indexes
    table.index('user_id');
    table.index('is_read');
    table.index('created_at');
    table.index('ride_id');
  });

  console.log('✅ Table "notifications" created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  console.log('❌ Table "notifications" dropped');
}
