import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
export const db = drizzle("postgresql://neondb_owner:npg_7wTjtmYCyP9X@ep-fancy-bonus-am31whqp.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",{
    schema
});
