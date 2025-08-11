import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: `postgresql://${process.env.PGSQL_USERNAME}:${process.env.PGSQL_ROOT_PASSWORD}@${process.env.PGSQL_HOST}:${process.env.PGSQL_PORT}/${process.env.PGSQL_DATABASE}`,
});
export const db = drizzle({ client: pool });
