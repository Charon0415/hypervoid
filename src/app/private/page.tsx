import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "私密空间 · Hypervoid",
  robots: { index: false, follow: false },
};

export default async function PrivatePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/private");
  }

  return (
    <div className="mx-auto  px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">私密空间</h1>
      <p className="mt-4 text-muted">
        这是仅登录用户可见的私密区域。你可以在这里放置个人笔记、收藏或其他私密内容。
      </p>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted">
          已登录为：<span className="font-medium text-foreground">{session.user.name ?? session.user.email}</span>
        </p>
      </div>
    </div>
  );
}
