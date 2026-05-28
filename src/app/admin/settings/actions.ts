"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth";
import {
  getSiteSetting,
  setSiteSetting,
} from "@/db/site-settings";
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

export async function toggleSiteLoginRequiredAction() {
  await requireAdmin();

  const enabled = (await getSiteSetting("site_login_required")) === "true";
  await setSiteSetting("site_login_required", enabled ? "false" : "true");
  revalidatePath("/admin/settings");
}
