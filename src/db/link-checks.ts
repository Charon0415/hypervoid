import "server-only";

import { sql as drizzleSql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type LinkCheckRow = typeof schema.linkChecks.$inferSelect;

export async function listLinkChecks(): Promise<LinkCheckRow[]> {
  return getDb()
    .select()
    .from(schema.linkChecks)
    .orderBy(drizzleSql`coalesce(${schema.linkChecks.status}, 999) desc, ${schema.linkChecks.lastCheckedAt} desc`);
}

export async function upsertLinkCheck(input: {
  url: string;
  status: number | null;
  errorMessage: string | null;
  postSlugs: string[];
}): Promise<void> {
  await getDb()
    .insert(schema.linkChecks)
    .values({
      url: input.url,
      status: input.status,
      errorMessage: input.errorMessage,
      postSlugs: input.postSlugs,
      lastCheckedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.linkChecks.url,
      set: {
        status: input.status,
        errorMessage: input.errorMessage,
        postSlugs: input.postSlugs,
        lastCheckedAt: new Date(),
      },
    });
}

export async function deleteLinkCheck(url: string): Promise<void> {
  await getDb()
    .delete(schema.linkChecks)
    .where(drizzleSql`${schema.linkChecks.url} = ${url}`);
}

export async function clearAllLinkChecks(): Promise<void> {
  await getDb().delete(schema.linkChecks);
}
