import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryingFetch: typeof fetch = async (input, init) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt === 1) break;
      await sleep(120);
    }
  }
  throw lastError;
};

neonConfig.fetchFunction = retryingFetch;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local locally and to Vercel project environment variables for production.",
    );
  }
  const sql: NeonQueryFunction<false, false> = neon(url);
  _db = drizzle({ client: sql, schema });
  return _db;
}

export { schema };
