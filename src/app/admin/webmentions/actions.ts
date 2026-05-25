"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteWebmention, setWebmentionHidden } from "@/lib/webmentions";
import { recordAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function toggleHiddenAction(
  id: string,
  hidden: boolean,
): Promise<void> {
  await requireAdmin();
  await setWebmentionHidden(id, hidden);
  await recordAudit({
    action: hidden ? "webmention.hide" : "webmention.show",
    targetType: "webmention",
    targetId: id,
  });
  revalidatePath("/admin/webmentions");
}

export async function deleteAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteWebmention(id);
  await recordAudit({
    action: "webmention.delete",
    targetType: "webmention",
    targetId: id,
  });
  revalidatePath("/admin/webmentions");
}
