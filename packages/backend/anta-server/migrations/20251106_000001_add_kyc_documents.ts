import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add KYC documents and metadata columns to drivers table
  await knex.schema.table("drivers", (table) => {
    // KYC Documents (JSON column for flexibility)
    table.json("kyc_documents").nullable().after("license_number");
    
    // KYC Approval metadata
    table.text("kyc_rejection_reason").nullable().after("kyc_status");
    table.timestamp("kyc_approved_at").nullable().after("kyc_rejection_reason");
    table.timestamp("kyc_rejected_at").nullable().after("kyc_approved_at");
    table.bigInteger("kyc_approved_by").unsigned().nullable().after("kyc_rejected_at");
    
    // Foreign key for admin who approved/rejected
    table.foreign("kyc_approved_by").references("id").inTable("users").onDelete("SET NULL");
  });

  // Add index for faster KYC queries
  await knex.schema.raw("CREATE INDEX idx_drivers_kyc_status ON drivers(kyc_status)");
}

export async function down(knex: Knex): Promise<void> {
  // Remove index
  await knex.schema.raw("DROP INDEX idx_drivers_kyc_status ON drivers");
  
  // Remove columns
  await knex.schema.table("drivers", (table) => {
    table.dropForeign(["kyc_approved_by"]);
    table.dropColumn("kyc_documents");
    table.dropColumn("kyc_rejection_reason");
    table.dropColumn("kyc_approved_at");
    table.dropColumn("kyc_rejected_at");
    table.dropColumn("kyc_approved_by");
  });
}
