import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // USERS
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('phone', 20).notNullable().unique();
    table.string('email', 255).unique();
    table.string('name', 100);
    table.string('password_hash', 255).notNullable();
    table.bigInteger('default_payment_method_id').unsigned();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // DRIVERS (vehicle_id FK added later to avoid circular dependency)
  await knex.schema.createTable('drivers', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().unique();
    table.bigInteger('vehicle_id').unsigned().nullable();
    table.enu('status', ['offline', 'online', 'busy', 'suspended']).notNullable().defaultTo('offline');
    table.enu('kyc_status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.decimal('rating_avg', 3, 2).notNullable().defaultTo(0.0);
    table.integer('total_trips').notNullable().defaultTo(0).unsigned();

    table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // VEHICLES (references drivers)
  await knex.schema.createTable('vehicles', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('driver_id').unsigned().notNullable().unique();
    table.enu('type', ['sedan', 'suv', 'van', 'bike', 'lux']).notNullable();
    table.string('model', 50).notNullable();
    table.string('color', 30).notNullable();
    table.integer('capacity').unsigned().notNullable();
    table.enu('status', ['pending', 'active', 'inactive', 'banned']).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('driver_id').references('drivers.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // Add circular FK: drivers.vehicle_id -> vehicles.id
  await knex.schema.alterTable('drivers', (table) => {
    table.foreign('vehicle_id').references('vehicles.id').onDelete('SET NULL').onUpdate('RESTRICT');
  });

  // TRIPS
  await knex.schema.createTable('trips', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('passenger_id').unsigned().notNullable();
    table.bigInteger('driver_id').unsigned().nullable();
    table.bigInteger('vehicle_id').unsigned().nullable();

    table.decimal('origin_lat', 10, 8).notNullable();
    table.decimal('origin_lng', 11, 8).notNullable();
    table.text('origin_text').notNullable();
    table.decimal('dest_lat', 10, 8).notNullable();
    table.decimal('dest_lng', 11, 8).notNullable();
    table.text('dest_text').notNullable();

    table.enu('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).notNullable().defaultTo('pending');
    table.integer('price_estimated').unsigned().notNullable();
    table.integer('price_final').unsigned().nullable();
    table.integer('distance_m').unsigned().notNullable();
    table.integer('duration_s').unsigned().notNullable();

    table.enu('payment_method', ['cash', 'card', 'wallet', 'promo']).nullable();
    table.enu('payment_status', ['pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled']).notNullable().defaultTo('pending');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('started_at').nullable();
    table.dateTime('ended_at').nullable();
    table.dateTime('cancelled_at').nullable();
    table.text('cancellation_reason');

    table.index(['passenger_id'], 'idx_trips_passenger');
    table.index(['driver_id'], 'idx_trips_driver');
    table.index(['status'], 'idx_trips_status');
    table.index(['created_at'], 'idx_trips_created');

    table.foreign('passenger_id').references('users.id').onDelete('RESTRICT').onUpdate('RESTRICT');
    table.foreign('driver_id').references('drivers.id').onDelete('SET NULL').onUpdate('RESTRICT');
    table.foreign('vehicle_id').references('vehicles.id').onDelete('SET NULL').onUpdate('RESTRICT');
  });

  // TRIPS_EVENTS
  await knex.schema.createTable('trips_events', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('trip_id').unsigned().notNullable();
    table.decimal('lat', 10, 8).nullable();
    table.decimal('lng', 11, 8).nullable();
    table.string('event_type', 50).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['trip_id', 'created_at'], 'idx_trip_events_trip');
    table.foreign('trip_id').references('trips.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // PAYMENTS
  await knex.schema.createTable('payments', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('trip_id').unsigned().notNullable();
    table.integer('amount').unsigned().notNullable();
    table.string('currency', 3).notNullable().defaultTo('EUR');
    table.enu('method', ['cash', 'card', 'wallet', 'promo']).notNullable();
    table.string('provider_ref', 255);
    table.enu('status', ['pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled']).notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['trip_id'], 'idx_payments_trip');
    table.index(['status'], 'idx_payments_status');
    table.foreign('trip_id').references('trips.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // WALLETS
  await knex.schema.createTable('wallets', (table) => {
    table.bigIncrements('id').primary();
    table.enu('owner_type', ['user', 'driver', 'platform']).notNullable();
    table.bigInteger('owner_id').unsigned().notNullable();
    table.bigInteger('balance_cents').notNullable().defaultTo(0).unsigned();
    table.string('currency', 3).notNullable().defaultTo('EUR');
    table.unique(['owner_type', 'owner_id'], { indexName: 'uk_wallets_owner' });
  });

  // PAYOUTS
  await knex.schema.createTable('payouts', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('driver_id').unsigned().notNullable();
    table.integer('amount').unsigned().notNullable();
    table.enu('status', ['pending', 'processing', 'paid', 'failed']).notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['driver_id'], 'idx_payouts_driver');
    table.foreign('driver_id').references('drivers.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // RATINGS
  await knex.schema.createTable('ratings', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('trip_id').unsigned().notNullable();
    table.bigInteger('from_user_id').unsigned().notNullable();
    table.bigInteger('to_user_id').unsigned().notNullable();
    table.integer('rating').notNullable();
    table.text('comment');

    table.index(['trip_id'], 'idx_ratings_trip');
    table.index(['to_user_id'], 'idx_ratings_to_user');

    table.foreign('trip_id').references('trips.id').onDelete('CASCADE').onUpdate('RESTRICT');
    table.foreign('from_user_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
    table.foreign('to_user_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // KYC_DOCUMENTS
  await knex.schema.createTable('kyc_documents', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('driver_id').unsigned().notNullable();
    table.string('storage_key', 255).notNullable();
    table.enu('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['driver_id'], 'idx_kyc_driver');
    table.foreign('driver_id').references('drivers.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // ZONES
  await knex.schema.createTable('zones', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable().unique();
    table.integer('base_fare').unsigned().notNullable();
    table.integer('per_km').unsigned().notNullable();
    table.integer('per_min').unsigned().notNullable();
    table.decimal('surge_multiplier', 4, 2).notNullable().defaultTo(1.0);
  });

  // FARES_HISTORY
  await knex.schema.createTable('fares_history', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('zone_id').unsigned().notNullable();
    table.dateTime('start_date').notNullable();
    table.dateTime('end_date').nullable();
    table.json('params_json').notNullable();

    table.index(['zone_id', 'start_date'], 'idx_fares_history_zone');
    table.foreign('zone_id').references('zones.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // DEVICE_TOKENS
  await knex.schema.createTable('device_tokens', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable();
    table.string('platform', 20).notNullable();
    table.string('token', 512).notNullable().unique();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_device_tokens_user');
    table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // SUPPORT_TICKETS
  await knex.schema.createTable('support_tickets', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().nullable();
    table.bigInteger('driver_id').unsigned().nullable();
    table.string('subject', 200).notNullable();
    table.enu('status', ['open', 'in_progress', 'resolved', 'closed']).notNullable().defaultTo('open');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['status'], 'idx_tickets_status');

    table.foreign('user_id').references('users.id').onDelete('SET NULL').onUpdate('RESTRICT');
    table.foreign('driver_id').references('drivers.id').onDelete('SET NULL').onUpdate('RESTRICT');
  });

  // MESSAGES
  await knex.schema.createTable('messages', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('sender_id').unsigned().notNullable();
    table.bigInteger('receiver_id').unsigned().notNullable();
    table.bigInteger('trip_id').unsigned().nullable();
    table.bigInteger('ticket_id').unsigned().nullable();
    table.text('content', 'longtext').notNullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['trip_id', 'created_at'], 'idx_messages_trip');
    table.index(['ticket_id', 'created_at'], 'idx_messages_ticket');

    table.foreign('sender_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
    table.foreign('receiver_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
    table.foreign('trip_id').references('trips.id').onDelete('CASCADE').onUpdate('RESTRICT');
    table.foreign('ticket_id').references('support_tickets.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // ADMIN_USERS
  await knex.schema.createTable('admin_users', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('role', 50).notNullable();
    table.json('permissions').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // SETTINGS
  await knex.schema.createTable('settings', (table) => {
    table.string('key', 100).primary();
    table.json('value').notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // PROMO_CODES
  await knex.schema.createTable('promo_codes', (table) => {
    table.bigIncrements('id').primary();
    table.string('code', 50).notNullable().unique();
    table.enu('discount_type', ['percent', 'flat']).notNullable();
    table.integer('value').unsigned().notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.integer('usage_limit').unsigned().nullable();
    table.dateTime('valid_from').nullable();
    table.dateTime('valid_to').nullable();
  });

  // DRIVER_LOCATION_LIVE
  await knex.schema.createTable('driver_location_live', (table) => {
    table.bigInteger('driver_id').unsigned().primary();
    table.decimal('lat', 10, 8).notNullable();
    table.decimal('lng', 11, 8).notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('driver_id').references('drivers.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });

  // AUDIT_LOGS
  await knex.schema.createTable('audit_logs', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().nullable();
    table.string('action', 100).notNullable();
    table.json('detail_json').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_audit_user');
    table.index(['action'], 'idx_audit_action');

    table.foreign('user_id').references('users.id').onDelete('SET NULL').onUpdate('RESTRICT');
  });

  // SESSIONS
  await knex.schema.createTable('sessions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable();
    table.string('token_hash', 255).notNullable().unique();
    table.dateTime('expires_at').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_sessions_user');
    table.index(['expires_at'], 'idx_sessions_expires');

    table.foreign('user_id').references('users.id').onDelete('CASCADE').onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse dependency order
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('driver_location_live');
  await knex.schema.dropTableIfExists('promo_codes');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('admin_users');
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('support_tickets');
  await knex.schema.dropTableIfExists('device_tokens');
  await knex.schema.dropTableIfExists('fares_history');
  await knex.schema.dropTableIfExists('zones');
  await knex.schema.dropTableIfExists('kyc_documents');
  await knex.schema.dropTableIfExists('ratings');
  await knex.schema.dropTableIfExists('payouts');
  await knex.schema.dropTableIfExists('wallets');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('trips_events');
  await knex.schema.dropTableIfExists('trips');

  // Remove circular FK first
  await knex.schema.alterTable('drivers', (table) => {
    table.dropForeign(['vehicle_id']);
  });

  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('drivers');
  await knex.schema.dropTableIfExists('users');
}
