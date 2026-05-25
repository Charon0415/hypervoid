import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listAllAnnouncements } from "@/db/announcements";
import { formatDateTimeCN } from "@/lib/datetime";
import { deleteAction, toggleAction } from "./actions";

export const metadata: Metadata = {
  title: "公告管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SLOT_LABEL: Record<string, string> = {
  top: "顶部条带",
  sidebar: "侧边栏卡片",
  article_top: "文章顶部",
};

export default async function AdminNotesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const list = await listAllAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">公告管理</h1>
          <span className="text-sm text-muted">共 {list.length} 条</span>
        </div>
        <Link
          href="/admin/notes/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + 新公告
        </Link>
      </header>

      <p className="text-sm text-muted">
        每个槽位（顶部 / 侧边栏 / 文章顶部）只显示优先级最高且在时间窗内的一条。
        高于此规则的优先级数值意味着更靠前。空起止时间表示「永久有效」。
      </p>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有公告。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((a) => (
            <li
              key={a.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 ${
                a.active ? "border-border bg-card" : "border-border bg-card/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {SLOT_LABEL[a.slot]}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-mono">
                      优先级 {a.priority}
                    </span>
                    {!a.active ? (
                      <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-[11px] text-muted">
                        已停用
                      </span>
                    ) : null}
                    {a.startsAt || a.endsAt ? (
                      <span className="font-mono text-[11px] text-muted">
                        {a.startsAt ? formatDateTimeCN(a.startsAt) : "立即"} →{" "}
                        {a.endsAt ? formatDateTimeCN(a.endsAt) : "永久"}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-muted">
                        永久有效
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground/90">
                    {a.message}
                  </p>
                  {a.link ? (
                    <p className="mt-1 text-xs text-primary/80">
                      → {a.linkText || "了解更多"}：
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 underline-offset-2 hover:underline"
                      >
                        {a.link}
                      </a>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Link
                    href={`/admin/notes/${a.id}/edit`}
                    className="rounded-md border border-border bg-card px-2.5 py-1 text-center text-[11px] transition hover:border-primary hover:text-primary"
                  >
                    编辑
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await toggleAction(a.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md border border-border bg-card px-2.5 py-1 text-[11px] transition hover:border-amber-500 hover:text-amber-600"
                    >
                      {a.active ? "停用" : "启用"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteAction(a.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                    >
                      删除
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
