import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listSeriesWithPosts } from "@/db/series-admin";
import { renameSeriesAction, deleteSeriesAction } from "./actions";

export const metadata: Metadata = {
  title: "专题合集",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const series = await listSeriesWithPosts();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">专题合集</h1>
        <span className="text-sm text-muted">共 {series.length} 个系列</span>
      </header>

      <p className="text-sm text-muted">
        管理文章系列：重命名或删除系列会批量更新所有关联文章。
        操作不可逆，建议先在
        <Link href="/admin/backup" className="mx-1 text-primary hover:underline">
          /admin/backup
        </Link>
        做一次快照。
      </p>

      {/* Rename form */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">重命名系列</h2>
        <form action={renameSeriesAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-muted">原系列名</span>
            <select
              name="oldName"
              required
              defaultValue=""
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                选一个系列…
              </option>
              {series.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count} 篇)
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-muted">新系列名</span>
            <input
              type="text"
              name="newName"
              required
              placeholder="新名字"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            重命名
          </button>
        </form>
      </section>

      {/* Series list */}
      {series.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有任何系列。在后台编辑文章时填写「所属系列」字段就会出现在这里。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {series.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-base font-semibold tracking-tight">
                    {s.name}
                  </h2>
                  <span className="font-mono text-xs text-muted">
                    {s.count} 篇
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/series/${encodeURIComponent(s.name)}`}
                    className="rounded-md border border-border px-2.5 py-1 text-[11px] transition hover:border-primary hover:text-primary"
                  >
                    前台查看
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteSeriesAction(s.name);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                    >
                      删除系列
                    </button>
                  </form>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {s.posts.map((p) => (
                  <li
                    key={p.slug}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition hover:bg-background"
                  >
                    {p.seriesOrder != null ? (
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                        {p.seriesOrder}
                      </span>
                    ) : (
                      <span className="h-5 w-5 shrink-0" />
                    )}
                    <Link
                      href={`/admin/posts/${p.slug}/edit`}
                      className="min-w-0 flex-1 truncate hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <span className="shrink-0 font-mono text-[11px] text-muted">
                      {p.slug}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
