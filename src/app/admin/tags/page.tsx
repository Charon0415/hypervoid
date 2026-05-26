import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listTagsWithUsage } from "@/db/tag-admin";
import {
  deleteTagAction,
  mergeTagsAction,
  renameTagAction,
} from "./actions";

export const metadata: Metadata = {
  title: "标签管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const tags = await listTagsWithUsage();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">标签管理</h1>
        <span className="text-sm text-muted">共 {tags.length} 个标签</span>
      </header>

      <p className="text-sm text-muted">
        改一处生效全站：重命名 / 合并 / 删除都会扫过所有文章，写入 audit。
        操作不可逆，建议先在
        <Link href="/admin/backup" className="mx-1 text-primary hover:underline">
          /admin/backup
        </Link>
        做一次快照。
      </p>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">重命名</h2>
          <form action={renameTagAction} className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">原标签</span>
              <select
                name="oldName"
                required
                defaultValue=""
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  选一个标签…
                </option>
                {tags.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.count})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">新标签名</span>
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
              className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              重命名
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">合并到</h2>
          <p className="mt-1 text-xs text-muted">
            勾选下方一个或多个标签，全部并入目标标签（重复会去重）。
          </p>
          <form
            action={mergeTagsAction}
            className="mt-3 flex flex-col gap-3"
            id="merge-form"
          >
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">目标标签名</span>
              <input
                type="text"
                name="target"
                required
                placeholder="如：JavaScript"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-muted">
              ▼ 在下表勾选要并入的源标签后点合并
            </p>
            <button
              type="submit"
              className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              合并所选
            </button>
          </form>
        </div>
      </section>

      {tags.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有标签。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium w-10"></th>
                <th className="px-4 py-3 font-medium">标签</th>
                <th className="px-4 py-3 font-medium">文章数</th>
                <th className="px-4 py-3 font-medium">出现于</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr key={t.name} className="border-t border-border bg-background">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name="sources"
                      value={t.name}
                      form="merge-form"
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">#{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.count}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {t.slugs.slice(0, 3).map((s, i) => (
                      <span key={s}>
                        <Link
                          href={`/admin/posts/${s}/edit`}
                          className="hover:text-primary"
                        >
                          {s}
                        </Link>
                        {i < Math.min(2, t.slugs.length - 1) ? "，" : ""}
                      </span>
                    ))}
                    {t.slugs.length > 3 ? (
                      <span> 等 {t.slugs.length} 篇</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteTagAction(t.name);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                      >
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
