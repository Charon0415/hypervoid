"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { setAiModel } from "@/lib/ai-config";
import { recordAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function updateModelAction(form: FormData): Promise<void> {
  await requireAdmin();
  const model = String(form.get("model") ?? "").trim();
  if (!model) throw new Error("缺少 model");
  await setAiModel(model);
  await recordAudit({
    action: "ai.model.update",
    targetType: "ai",
    details: { model },
  });
  revalidatePath("/admin/ai");
}
