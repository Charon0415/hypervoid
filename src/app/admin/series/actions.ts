"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { renameSeries, deleteSeries } from "@/db/series-admin";

export async function renameSeriesAction(form: FormData): Promise<void> {
  await requireAdmin();
  const oldName = String(form.get("oldName") ?? "").trim();
  const newName = String(form.get("newName") ?? "").trim();
  if (!oldName || !newName) throw new Error("旧名/新名不能为空");
  const n = await renameSeries(oldName, newName);
  await recordAudit({
    action: "series.rename",
    targetType: "series",
    targetId: oldName,
    details: { newName, postsTouched: n },
  });
  revalidatePath("/admin/series");
}

export async function deleteSeriesAction(name: string): Promise<void> {
  await requireAdmin();
  if (!name) throw new Error("缺少系列名");
  const n = await deleteSeries(name);
  await recordAudit({
    action: "series.delete",
    targetType: "series",
    targetId: name,
    details: { postsTouched: n },
  });
  revalidatePath("/admin/series");
}
