import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create promotions table
  await knex.schema.createTable("promotions", (table) => {
    table.increments("id").primary();
    table.string("code", 50).notNullable().unique();
    table.text("description").nullable();
    table.enum("type", ["percentage", "fixed_amount"]).notNullable();
    table.decimal("value", 10, 2).notNullable(); // Percentage (0-100) or fixed amount
    table.decimal("min_trip_amount", 10, 2).nullable(); // Minimum trip amount to apply promo
    table.decimal("max_discount", 10, 2).nullable(); // Maximum discount amount
    table.integer("usage_limit").nullable(); // Total number of times it can be used
    table.integer("usage_count").defaultTo(0); // Number of times it has been used
    table.integer("usage_per_user").nullable(); // Max uses per user
    table.boolean("is_active").defaultTo(true);
    table.timestamp("valid_from").nullable();
    table.timestamp("valid_until").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create promotion_usages table to track user usage
  await knex.schema.createTable("promotion_usages", (table) => {
    table.increments("id").primary();
    table.integer("promotion_id").unsigned().notNullable();
    table.bigInteger("user_id").unsigned().notNullable(); // BIGINT pour correspondre à users.id
    table.bigInteger("trip_id").unsigned().nullable(); // BIGINT pour correspondre à trips.id
    table.decimal("discount_amount", 10, 2).notNullable();
    table.timestamp("used_at").defaultTo(knex.fn.now());

    table.foreign("promotion_id").references("promotions.id").onDelete("CASCADE");
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.foreign("trip_id").references("trips.id").onDelete("SET NULL");

    table.index("promotion_id");
    table.index("user_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("promotion_usages");
  await knex.schema.dropTableIfExists("promotions");
}
