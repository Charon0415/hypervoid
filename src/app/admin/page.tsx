import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const login =
    (session.user as { login?: string }).login ?? session.user.name ?? "?";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
          <p className="mt-1 text-sm text-muted">
            登录身份：<span className="font-medium">@{login}</span>
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
          >
            退出登录
          </button>
        </form>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/posts"
          className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
        >
          <h2 className="text-lg font-semibold group-hover:text-primary">
            文章管理 →
          </h2>
          <p className="mt-1 text-sm text-muted">
            创建、编辑、删除文章，草稿、定时发布。
          </p>
        </Link>
        <div className="rounded-xl border border-dashed border-border p-6 text-muted">
          <h2 className="text-lg font-semibold">媒体库（TBD）</h2>
          <p className="mt-1 text-sm">
            上传图片到 R2，编辑器粘贴用。
          </p>
        </div>
      </div>
    </div>
  );
}
