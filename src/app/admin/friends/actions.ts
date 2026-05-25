"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import {
  approveApplication,
  createFriend,
  deleteFriend,
  rejectApplication,
  updateFriend,
  type FriendInput,
} from "@/db/friends";

async function requireAuth() {
  await requireAdmin();
}

function parseForm(formData: FormData): FriendInput {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!name) throw new Error("name is required");
  if (!url) throw new Error("url is required");
  try {
    new URL(url);
  } catch {
    throw new Error("url 格式不对");
  }

  const avatar = String(formData.get("avatar") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrderStr = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.isFinite(Number(sortOrderStr))
    ? Number(sortOrderStr)
    : 0;

  return {
    name,
    url,
    avatar: avatar || null,
    description: description || null,
    sortOrder,
  };
}

export async function createFriendAction(formData: FormData) {
  await requireAuth();
  const input = parseForm(formData);
  await createFriend(input);
  revalidatePath("/friends");
  revalidatePath("/admin/friends");
  redirect("/admin/friends");
}

export async function updateFriendAction(id: string, formData: FormData) {
  await requireAuth();
  const input = parseForm(formData);
  await updateFriend(id, input);
  revalidatePath("/friends");
  revalidatePath("/admin/friends");
  redirect("/admin/friends");
}

export async function deleteFriendAction(id: string) {
  await requireAuth();
  await deleteFriend(id);
  revalidatePath("/friends");
  revalidatePath("/admin/friends");
  redirect("/admin/friends");
}

export async function approveApplicationAction(id: string) {
  await requireAuth();
  await approveApplication(id);
  revalidatePath("/friends");
  revalidatePath("/admin/friends");
}

export async function rejectApplicationAction(id: string) {
  await requireAuth();
  await rejectApplication(id);
  revalidatePath("/friends");
  revalidatePath("/admin/friends");
}
