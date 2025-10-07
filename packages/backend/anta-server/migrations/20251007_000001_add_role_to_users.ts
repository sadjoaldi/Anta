import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add role column to users table
  await knex.schema.table("users", (table) => {
    table.enum("role", ["passenger", "driver", "admin"])
      .notNullable()
      .defaultTo("passenger")
      .after("password_hash");
  });

  // Add index for faster role queries
  await knex.schema.raw("CREATE INDEX idx_users_role ON users(role)");
}

export async function down(knex: Knex): Promise<void> {
  // Remove index
  await knex.schema.raw("DROP INDEX idx_users_role ON users");
  
  // Remove role column
  await knex.schema.table("users", (table) => {
    table.dropColumn("role");
  });
}
