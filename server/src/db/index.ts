import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

export const db = drizzle({
  client: pool,
});

export async function connectDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}