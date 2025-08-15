import { defineConfig } from 'drizzle-kit';
import { dbConnectionUrl } from "./src/db/connections"

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbConnectionUrl,
  },
});