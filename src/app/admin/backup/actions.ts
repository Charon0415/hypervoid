"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { createBackup, deleteBackupRecord } from "@/lib/db-backup";

export async function createBackupAction(): Promise<void> {
  await requireAdmin();
  const row = await createBackup();
  await recordAudit({
    action: "backup.create",
    targetType: "backup",
    targetId: row.id,
    details: {
      sizeBytes: row.sizeBytes,
      tableCounts: row.tableCounts,
    },
  });
  revalidatePath("/admin/backup");
}

export async function deleteBackupAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteBackupRecord(id);
  await recordAudit({
    action: "backup.delete",
    targetType: "backup",
    targetId: id,
  });
  revalidatePath("/admin/backup");
}
