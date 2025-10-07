import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add vehicle and banking details columns to drivers table
  await knex.schema.table("drivers", (table) => {
    // Vehicle information
    table.string("vehicle_type", 50).nullable().after("total_trips");
    table.string("vehicle_brand", 50).nullable().after("vehicle_type");
    table.string("vehicle_model", 50).nullable().after("vehicle_brand");
    table.string("vehicle_color", 30).nullable().after("vehicle_model");
    table.string("vehicle_plate", 20).nullable().after("vehicle_color");
    table.integer("vehicle_capacity").unsigned().nullable().after("vehicle_plate");
    
    // License information
    table.string("license_number", 50).nullable().after("vehicle_capacity");
    
    // Banking information
    table.string("bank_name", 100).nullable().after("license_number");
    table.string("account_number", 50).nullable().after("bank_name");
    table.string("account_holder", 100).nullable().after("account_number");
  });

  // Add indexes for faster searches
  await knex.schema.raw("CREATE INDEX idx_drivers_vehicle_plate ON drivers(vehicle_plate)");
  await knex.schema.raw("CREATE INDEX idx_drivers_license ON drivers(license_number)");
}

export async function down(knex: Knex): Promise<void> {
  // Remove indexes
  await knex.schema.raw("DROP INDEX idx_drivers_vehicle_plate ON drivers");
  await knex.schema.raw("DROP INDEX idx_drivers_license ON drivers");
  
  // Remove columns
  await knex.schema.table("drivers", (table) => {
    table.dropColumn("vehicle_type");
    table.dropColumn("vehicle_brand");
    table.dropColumn("vehicle_model");
    table.dropColumn("vehicle_color");
    table.dropColumn("vehicle_plate");
    table.dropColumn("vehicle_capacity");
    table.dropColumn("license_number");
    table.dropColumn("bank_name");
    table.dropColumn("account_number");
    table.dropColumn("account_holder");
  });
}
