"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import { setSiteSetting } from "@/db/site-settings";
import {
  OVERRIDABLE_FIELDS,
  setSiteOverrides,
  type OverridableFields,
} from "@/lib/site-config-server";

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  const entries: { key: OverridableFields; value: string }[] = [];
  for (const { key } of OVERRIDABLE_FIELDS) {
    if (!formData.has(key)) continue;
    entries.push({
      key,
      value: String(formData.get(key) ?? ""),
    });
  }

  await setSiteOverrides(entries);
  revalidatePath("/admin/settings");
}

export async function setLoginPolicyAction(formData: FormData) {
  await requireAdmin();

  const policy = String(formData.get("login_policy") ?? "optional");
  const valid = ["optional", "required", "private_only"];
  await setSiteSetting("site_login_required", valid.includes(policy) ? policy : "optional");
  revalidatePath("/admin/settings");
}
