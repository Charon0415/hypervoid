"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { clearSearchLog } from "@/db/search-log";

export async function clearSearchLogAction(): Promise<void> {
  await requireAdmin();
  await clearSearchLog();
  await recordAudit({ action: "search-log.clear" });
  revalidatePath("/admin/search-log");
}
