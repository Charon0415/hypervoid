"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { deleteTag, mergeTags, renameTag } from "@/db/tag-admin";

export async function renameTagAction(form: FormData): Promise<void> {
  await requireAdmin();
  const oldName = String(form.get("oldName") ?? "").trim();
  const newName = String(form.get("newName") ?? "").trim();
  if (!oldName || !newName) throw new Error("旧名/新名不能为空");
  const n = await renameTag(oldName, newName);
  await recordAudit({
    action: "tag.rename",
    targetType: "tag",
    targetId: oldName,
    details: { newName, postsTouched: n },
  });
  revalidatePath("/admin/tags");
}

export async function mergeTagsAction(form: FormData): Promise<void> {
  await requireAdmin();
  const sources = form
    .getAll("sources")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const target = String(form.get("target") ?? "").trim();
  if (sources.length === 0) throw new Error("请勾选至少一个源标签");
  if (!target) throw new Error("目标标签不能为空");
  const n = await mergeTags(sources, target);
  await recordAudit({
    action: "tag.merge",
    targetType: "tag",
    targetId: target,
    details: { sources, postsTouched: n },
  });
  revalidatePath("/admin/tags");
}

export async function deleteTagAction(name: string): Promise<void> {
  await requireAdmin();
  if (!name) throw new Error("缺少标签名");
  const n = await deleteTag(name);
  await recordAudit({
    action: "tag.delete",
    targetType: "tag",
    targetId: name,
    details: { postsTouched: n },
  });
  revalidatePath("/admin/tags");
}
