"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut, ADMIN_LOGIN } from "@/auth";
import {
  deleteMessage,
  hideMessage,
  postMessage,
} from "@/db/guestbook";

export async function postGuestbookAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("请先用 GitHub 登录");
  const login = (session.user as { login?: string }).login;
  if (!login) throw new Error("Missing GitHub login on session");

  const raw = String(formData.get("message") ?? "").trim();
  if (!raw) throw new Error("内容不能为空");
  if (raw.length > 1000) throw new Error("最多 1000 字");

  await postMessage({
    githubLogin: login,
    githubName: session.user.name ?? null,
    avatarUrl: session.user.image ?? null,
    message: raw,
  });
  revalidatePath("/guestbook");
}

export async function hideGuestbookAction(id: string) {
  const session = await auth();
  const login = (session?.user as { login?: string } | undefined)?.login;
  if (login !== ADMIN_LOGIN) throw new Error("Forbidden");
  await hideMessage(id);
  revalidatePath("/guestbook");
}

export async function deleteGuestbookAction(id: string) {
  const session = await auth();
  const login = (session?.user as { login?: string } | undefined)?.login;
  if (login !== ADMIN_LOGIN) throw new Error("Forbidden");
  await deleteMessage(id);
  revalidatePath("/guestbook");
}

export async function signInForGuestbook() {
  await signIn("github", { redirectTo: "/guestbook" });
}

export async function signOutFromGuestbook() {
  await signOut({ redirectTo: "/guestbook" });
}
