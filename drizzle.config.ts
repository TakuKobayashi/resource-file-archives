import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.PGSQL_USERNAME}:${process.env.PGSQL_ROOT_PASSWORD}@${process.env.PGSQL_HOST}:${process.env.PGSQL_PORT}/${process.env.PGSQL_DATABASE}`,
  },
});