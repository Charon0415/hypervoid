import "server-only";

import { desc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type VisitorLogin = typeof schema.visitorLogins.$inferSelect;

/**
 * UPSERT on every GitHub sign-in. First time creates the row; subsequent
 * logins bump loginCount + lastSeenAt and refresh the cached name/avatar
 * in case the visitor updated their GitHub profile.
 */
export async function recordVisitorLogin(input: {
  githubLogin: string;
  githubName: string | null;
  avatarUrl: string | null;
}): Promise<void> {
  await getDb()
    .insert(schema.visitorLogins)
    .values({
      githubLogin: input.githubLogin,
      githubName: input.githubName,
      avatarUrl: input.avatarUrl,
      loginCount: 1,
    })
    .onConflictDoUpdate({
      target: schema.visitorLogins.githubLogin,
      set: {
        githubName: input.githubName,
        avatarUrl: input.avatarUrl,
        loginCount: sql`${schema.visitorLogins.loginCount} + 1`,
        lastSeenAt: sql`NOW()`,
      },
    });
}

export async function listVisitorLogins(limit = 50): Promise<VisitorLogin[]> {
  return getDb()
    .select()
    .from(schema.visitorLogins)
    .orderBy(desc(schema.visitorLogins.lastSeenAt))
    .limit(limit);
}

export async function countVisitorLogins(): Promise<number> {
  const rows = await getDb()
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(schema.visitorLogins);
  return rows[0]?.count ?? 0;
}
