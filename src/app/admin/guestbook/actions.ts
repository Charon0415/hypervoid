"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  deleteMessage,
  hideMessage,
  unhideMessage,
} from "@/db/guestbook";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function hideAction(id: string): Promise<void> {
  await requireAdmin();
  await hideMessage(id);
  revalidatePath("/admin/guestbook");
  revalidatePath("/guestbook");
}

export async function unhideAction(id: string): Promise<void> {
  await requireAdmin();
  await unhideMessage(id);
  revalidatePath("/admin/guestbook");
  revalidatePath("/guestbook");
}

export async function deleteAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteMessage(id);
  revalidatePath("/admin/guestbook");
  revalidatePath("/guestbook");
}
