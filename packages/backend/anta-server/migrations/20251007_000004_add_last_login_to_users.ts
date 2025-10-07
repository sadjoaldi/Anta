import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add last_login_at column to track user activity
  await knex.schema.table("users", (table) => {
    table.timestamp("last_login_at").nullable().after("updated_at");
  });

  // Add index for faster queries on active users
  await knex.schema.raw("CREATE INDEX idx_users_last_login ON users(last_login_at)");
}

export async function down(knex: Knex): Promise<void> {
  // Remove index
  await knex.schema.raw("DROP INDEX idx_users_last_login ON users");
  
  // Remove column
  await knex.schema.table("users", (table) => {
    table.dropColumn("last_login_at");
  });
}
