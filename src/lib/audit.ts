import "server-only";

import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { auth } from "@/auth";

export type AuditLogRow = typeof schema.auditLog.$inferSelect;

/**
 * Best-effort logger — never throws, so it can wrap admin actions without
 * affecting their success path. Captures the actor from the current session
 * automatically; pass `actor` to override (e.g. for cron jobs).
 */
export async function recordAudit(input: {
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  actor?: string;
}): Promise<void> {
  try {
    let actor = input.actor;
    if (!actor) {
      const session = await auth();
      const user = session?.user as { login?: string } | undefined;
      actor = user?.login ?? "unknown";
    }
    await getDb().insert(schema.auditLog).values({
      actor,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      details: input.details ?? null,
    });
  } catch {
    // swallow — audit is best-effort
  }
}

export async function listAuditLog(limit = 200): Promise<AuditLogRow[]> {
  return getDb()
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(limit);
}
