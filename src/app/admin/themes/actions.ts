"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { saveCustomTheme, type ThemeColors } from "@/lib/custom-theme";
import { recordAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function saveThemeAction(input: {
  enabled: boolean;
  light: ThemeColors;
  dark: ThemeColors;
}): Promise<void> {
  await requireAdmin();
  await saveCustomTheme(input);
  await recordAudit({
    action: "theme.save",
    targetType: "custom_theme",
    details: { enabled: input.enabled, lightKeys: Object.keys(input.light), darkKeys: Object.keys(input.dark) },
  });
  revalidatePath("/", "layout");
}
