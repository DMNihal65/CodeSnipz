import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"
const sql = neon(process.env.NEXT_PUBLIC_DB_URL);
// const db = drizzle(sql);

export const db = drizzle(sql,{schema})