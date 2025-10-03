import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const url = new URL(dbUrl);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading '/'
    ssl: url.searchParams.get('sslmode') === 'disable' ? false : true, // Handle sslmode=disable
  },
} satisfies Config);
