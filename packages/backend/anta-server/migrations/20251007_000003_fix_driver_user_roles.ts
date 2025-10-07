import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Update user role to 'driver' ONLY for users with APPROVED driver profiles
  // Users with pending or rejected profiles remain as 'passenger'
  await knex.raw(`
    UPDATE users u
    INNER JOIN drivers d ON u.id = d.user_id
    SET u.role = 'driver'
    WHERE u.role = 'passenger' AND d.kyc_status = 'approved'
  `);
}

export async function down(knex: Knex): Promise<void> {
  // No rollback needed - this is a data fix
  // Manually revert if needed
}
