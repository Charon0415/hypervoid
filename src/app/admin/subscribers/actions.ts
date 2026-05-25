"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  deleteSubscriber,
  forceUnsubscribe,
  restoreSubscriber,
} from "@/db/subscribers";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) throw new Error("Not authorized");
}

export async function deleteAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteSubscriber(id);
  revalidatePath("/admin/subscribers");
}

export async function unsubscribeAction(id: string): Promise<void> {
  await requireAdmin();
  await forceUnsubscribe(id);
  revalidatePath("/admin/subscribers");
}

export async function restoreAction(id: string): Promise<void> {
  await requireAdmin();
  await restoreSubscriber(id);
  revalidatePath("/admin/subscribers");
}
