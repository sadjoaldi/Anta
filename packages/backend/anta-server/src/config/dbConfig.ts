import type { Knex } from 'knex';

// Builds the Knex configuration from environment variables
export function buildKnexConfig(): Knex.Config {
  return {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'anta',
      port: Number(process.env.MYSQL_PORT || 3306),
      charset: process.env.MYSQL_CHARSET || 'utf8mb4',
      timezone: process.env.MYSQL_TZ || 'Z',
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: false
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN || 2),
      max: Number(process.env.DB_POOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.DB_POOL_IDLE || 30000)
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  } satisfies Knex.Config;
}

// Export a map for Knex CLI compatibility when needed
export function buildEnvKnexConfig(): { [key: string]: Knex.Config } {
  return {
    development: buildKnexConfig()
  };
}
