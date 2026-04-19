import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL??"postgresql://neondb_owner:npg_7wTjtmYCyP9X@ep-fancy-bonus-am31whqp.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
