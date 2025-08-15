import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const dbConnectionUrl = `postgresql://${process.env.PGSQL_USERNAME}:${process.env.PGSQL_ROOT_PASSWORD}@${process.env.PGSQL_HOST}:${process.env.PGSQL_PORT}/${process.env.PGSQL_DATABASE}`;

const pool = new Pool({
  connectionString: dbConnectionUrl,
  max: 20, // 接続を張り続けるコネクション数を指定
});
export const db = drizzle({ client: pool });
