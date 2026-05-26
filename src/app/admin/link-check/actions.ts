"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { clearAllLinkChecks, deleteLinkCheck } from "@/db/link-checks";
import { runLinkCheck } from "@/lib/link-scanner";

export async function runScanAction(): Promise<void> {
  await requireAdmin();
  const result = await runLinkCheck();
  await recordAudit({
    action: "link-check.scan",
    details: result,
  });
  revalidatePath("/admin/link-check");
}

export async function deleteLinkAction(url: string): Promise<void> {
  await requireAdmin();
  await deleteLinkCheck(url);
  await recordAudit({
    action: "link-check.delete",
    targetType: "url",
    targetId: url,
  });
  revalidatePath("/admin/link-check");
}

export async function clearAllAction(): Promise<void> {
  await requireAdmin();
  await clearAllLinkChecks();
  await recordAudit({ action: "link-check.clear" });
  revalidatePath("/admin/link-check");
}
