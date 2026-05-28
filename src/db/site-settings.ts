import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export async function getSiteSetting(key: string): Promise<string | null> {
  const rows = await getDb()
    .select({ value: schema.siteOverrides.value })
    .from(schema.siteOverrides)
    .where(eq(schema.siteOverrides.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  await getDb()
    .insert(schema.siteOverrides)
    .values({ key, value })
    .onConflictDoUpdate({
      target: schema.siteOverrides.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function isSiteLoginRequired(): Promise<boolean> {
  const val = await getSiteSetting("site_login_required");
  return val === "true";
}
