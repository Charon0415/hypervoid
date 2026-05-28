"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { recordAudit } from "@/lib/audit";
import {
  createSeries,
  updateSeries,
  deleteSeries,
  setPostSeries,
  setPostOrder,
} from "@/db/series-admin";

export async function createSeriesAction(form: FormData): Promise<void> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const cover = String(form.get("cover") ?? "").trim();
  if (!name || !slug) throw new Error("名称和 slug 不能为空");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug))
    throw new Error("slug 只能包含小写字母、数字和连字符");
  await createSeries({ slug, name, description, cover });
  await recordAudit({
    action: "series.create",
    targetType: "series",
    targetId: slug,
    details: { name },
  });
  revalidatePath("/admin/series");
}

export async function updateSeriesAction(form: FormData): Promise<void> {
  await requireAdmin();
  const oldSlug = String(form.get("oldSlug") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const cover = String(form.get("cover") ?? "").trim();
  if (!oldSlug || !name || !slug) throw new Error("缺少必填字段");
  await updateSeries(oldSlug, { slug, name, description, cover });
  await recordAudit({
    action: "series.update",
    targetType: "series",
    targetId: slug,
    details: { oldSlug, name },
  });
  revalidatePath("/admin/series");
}

export async function deleteSeriesAction(slug: string): Promise<void> {
  await requireAdmin();
  if (!slug) throw new Error("缺少系列 slug");
  const n = await deleteSeries(slug);
  await recordAudit({
    action: "series.delete",
    targetType: "series",
    targetId: slug,
    details: { postsTouched: n },
  });
  revalidatePath("/admin/series");
}

export async function assignPostToSeriesAction(
  postSlug: string,
  seriesName: string | null,
): Promise<void> {
  await requireAdmin();
  await setPostSeries(postSlug, seriesName);
  await recordAudit({
    action: "series.assign",
    targetType: "post",
    targetId: postSlug,
    details: { series: seriesName },
  });
  revalidatePath("/admin/series");
}

export async function reorderPostAction(
  postSlug: string,
  order: number,
): Promise<void> {
  await requireAdmin();
  await setPostOrder(postSlug, order);
  revalidatePath("/admin/series");
}
