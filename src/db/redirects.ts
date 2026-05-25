import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type Redirect = typeof schema.redirects.$inferSelect;

export async function listRedirects(): Promise<Redirect[]> {
  return getDb()
    .select()
    .from(schema.redirects)
    .orderBy(desc(schema.redirects.createdAt));
}

export async function createRedirect(input: {
  code: string;
  toUrl: string;
  note?: string | null;
}): Promise<void> {
  await getDb()
    .insert(schema.redirects)
    .values({
      code: input.code,
      toUrl: input.toUrl,
      note: input.note ?? null,
    });
}

export async function deleteRedirect(id: string): Promise<void> {
  await getDb()
    .delete(schema.redirects)
    .where(eq(schema.redirects.id, id));
}

export async function resolveAndHit(code: string): Promise<string | null> {
  const rows = await getDb()
    .update(schema.redirects)
    .set({ hits: sql`${schema.redirects.hits} + 1` })
    .where(eq(schema.redirects.code, code))
    .returning({ toUrl: schema.redirects.toUrl });
  return rows[0]?.toUrl ?? null;
}
