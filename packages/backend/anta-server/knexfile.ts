import type { Knex } from 'knex';

const client = (process.env.DB_CLIENT || 'mysql2') as 'mysql2' | 'pg' | 'sqlite3';

const config: { [key: string]: Knex.Config } = {
  development: {
    client,
    connection:
      client === 'pg'
        ? {
            host: process.env.PG_HOST || 'localhost',
            user: process.env.PG_USER || 'postgres',
            password: process.env.PG_PASSWORD || 'postgres',
            database: process.env.PG_DATABASE || 'anta'
          }
        : client === 'sqlite3'
        ? { filename: process.env.SQLITE_FILE || './data/anta.sqlite' }
        : {
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'anta',
            port: Number(process.env.MYSQL_PORT || 3306)
          },
    useNullAsDefault: client === 'sqlite3',
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  }
};

export default config;
