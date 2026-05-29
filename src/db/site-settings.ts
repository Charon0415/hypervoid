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

/**
 * Returns the login policy: "optional" (default), "required", or "private_only".
 */
export async function getLoginPolicy(): Promise<"optional" | "required" | "private_only"> {
  const val = await getSiteSetting("site_login_required");
  if (val === "required" || val === "private_only") return val;
  return "optional";
}

/** @deprecated Use getLoginPolicy() instead */
export async function isSiteLoginRequired(): Promise<boolean> {
  const policy = await getLoginPolicy();
  return policy === "required";
}
