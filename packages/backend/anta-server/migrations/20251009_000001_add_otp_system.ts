import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add phone_verified to users table
  await knex.schema.alterTable("users", (table) => {
    table.boolean("phone_verified").notNullable().defaultTo(false);
    table.timestamp("phone_verified_at").nullable();
  });

  // Create otp_codes table for temporary OTP storage
  await knex.schema.createTable("otp_codes", (table) => {
    table.bigIncrements("id").primary();
    table.string("phone", 20).notNullable();
    table.string("code", 6).notNullable();
    table.string("purpose", 50).notNullable(); // 'registration', 'login', 'reset_password'
    table.integer("attempts").unsigned().notNullable().defaultTo(0);
    table.timestamp("expires_at").notNullable();
    table.timestamp("verified_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    
    // Index for fast lookup
    table.index(["phone", "purpose", "verified_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("otp_codes");
  
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("phone_verified");
    table.dropColumn("phone_verified_at");
  });
}
