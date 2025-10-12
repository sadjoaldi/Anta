import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add location columns to drivers table
  await knex.schema.table("drivers", (table) => {
    table.decimal("current_latitude", 10, 8).nullable();
    table.decimal("current_longitude", 11, 8).nullable();
    table.timestamp("location_updated_at").nullable();
  });

  // Add index for location-based queries
  await knex.schema.raw(
    "CREATE INDEX idx_drivers_location ON drivers(current_latitude, current_longitude)"
  );
}

export async function down(knex: Knex): Promise<void> {
  // Remove index
  await knex.schema.raw("DROP INDEX idx_drivers_location ON drivers");
  
  // Remove columns
  await knex.schema.table("drivers", (table) => {
    table.dropColumn("current_latitude");
    table.dropColumn("current_longitude");
    table.dropColumn("location_updated_at");
  });
}
