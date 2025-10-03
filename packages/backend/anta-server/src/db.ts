import knex, { Knex } from 'knex';
import { config as dotenvConfig } from 'dotenv';
import { buildKnexConfig } from './config/dbConfig.js';

// Load environment variables
dotenvConfig();

// Create and export the Knex instance
const db: Knex = knex(buildKnexConfig());

export default db;
