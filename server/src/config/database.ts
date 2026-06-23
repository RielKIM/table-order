import knex from 'knex';
import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// DB 연결 설정 빌더
// - DATABASE_URL 이 있으면 우선 사용 (Render 등 PaaS 주입 값)
//   Render PostgreSQL 은 SSL 연결이 필요하므로 ssl 옵션을 활성화한다.
// - 없으면 개별 환경변수(DB_HOST/DB_PORT/...) 조합으로 로컬/개발 연결.
function buildConnection(): Knex.PgConnectionConfig {
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
    database: process.env.DB_NAME || 'table_order',
  };
}

const db = knex({
  client: 'pg',
  connection: buildConnection(),
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
