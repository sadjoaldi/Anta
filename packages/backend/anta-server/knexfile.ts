import type { Knex } from 'knex';
import { config as dotenvConfig } from 'dotenv';
import { buildEnvKnexConfig } from './src/config/dbConfig.js';

// Load environment variables before building config
dotenvConfig();

const config: { [key: string]: Knex.Config } = buildEnvKnexConfig();

export default config;
