import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create admin_logs table to track admin actions
  await knex.schema.createTable("admin_logs", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("admin_id").unsigned().notNullable(); // Admin who performed action
    table.string("action", 100).notNullable(); // Action type (e.g., 'user_suspended', 'driver_approved')
    table.string("resource_type", 50).notNullable(); // Type of resource (e.g., 'user', 'driver', 'trip')
    table.bigInteger("resource_id").unsigned().nullable(); // ID of affected resource
    table.text("details").nullable(); // JSON or text with additional details
    table.string("ip_address", 45).nullable(); // IPv4 or IPv6
    table.string("user_agent", 255).nullable(); // Browser/client info
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign key
    table.foreign("admin_id").references("users.id").onDelete("CASCADE");

    // Indexes for faster queries
    table.index("admin_id");
    table.index("action");
    table.index("resource_type");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("admin_logs");
}
