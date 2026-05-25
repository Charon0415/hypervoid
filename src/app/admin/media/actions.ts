"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteBlob } from "@/lib/blob";
import { recordAudit } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function deleteBlobAction(url: string): Promise<void> {
  await requireAdmin();
  await deleteBlob(url);
  await recordAudit({ action: "media.delete", targetType: "blob", targetId: url });
  revalidatePath("/admin/media");
}
