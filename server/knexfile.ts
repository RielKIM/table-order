import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// DB 연결 설정 빌더 (config/database.ts 와 동일한 우선순위 규칙)
// - DATABASE_URL 이 있으면 우선 사용하고 SSL 활성화 (Render PostgreSQL 필요)
// - 없으면 개별 환경변수 조합 사용
function buildConnection(database?: string): Knex.PgConnectionConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && databaseUrl.trim() !== '') {
    return {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: database || process.env.DB_NAME || 'table_order',
  };
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: buildConnection(),
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../database/seeds',
      extension: 'ts',
    },
  },
  test: {
    client: 'pg',
    connection: buildConnection(process.env.DB_NAME_TEST || 'table_order_test'),
    pool: { min: 1, max: 5 },
    migrations: {
      directory: '../database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../database/seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: buildConnection(),
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../database/seeds',
      extension: 'ts',
    },
  },
};

export default config;
