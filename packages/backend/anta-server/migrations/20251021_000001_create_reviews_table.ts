/**
 * Migration: Create reviews table
 * Date: 2025-10-21
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reviews', (table) => {
    table.bigIncrements('id').primary();
    
    // Ride reference
    table.bigInteger('ride_id').unsigned().notNullable();
    
    // Reviewer and reviewed
    table.bigInteger('reviewer_id').unsigned().notNullable().comment('User who writes the review');
    table.bigInteger('reviewed_id').unsigned().notNullable().comment('User being reviewed');
    table.enum('reviewer_type', ['passenger', 'driver']).notNullable();
    
    // Rating (1-5 stars)
    table.integer('rating').notNullable().comment('1-5 stars');
    
    // Detailed ratings (optional, 1-5 each)
    table.integer('rating_cleanliness').nullable();
    table.integer('rating_punctuality').nullable();
    table.integer('rating_communication').nullable();
    table.integer('rating_safety').nullable();
    
    // Comment
    table.text('comment').nullable();
    
    // Badges/Tags
    table.json('tags').nullable().comment('Array of tags: ["Friendly", "Clean car", etc.]');
    
    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('ride_id').references('id').inTable('rides').onDelete('CASCADE');
    table.foreign('reviewer_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('reviewed_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('ride_id');
    table.index('reviewer_id');
    table.index('reviewed_id');
    table.index('rating');
    table.index('created_at');
    
    // Unique constraint: one review per ride per reviewer
    table.unique(['ride_id', 'reviewer_id']);
  });

  console.log('✅ Table "reviews" created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reviews');
  console.log('❌ Table "reviews" dropped');
}
