import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listRedirects } from "@/db/redirects";
import { formatDateTimeCN } from "@/lib/datetime";
import { siteConfig } from "@/lib/site-config";
import { createAction, deleteAction } from "./actions";

export const metadata: Metadata = {
  title: "短链管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const list = await listRedirects();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">短链管理</h1>
        <span className="text-sm text-muted">共 {list.length} 条</span>
      </header>

      <p className="text-sm text-muted">
        创建后访问 <code>{siteConfig.url}/r/&lt;短码&gt;</code> 会 307 跳转到目标地址，并 +1 计数。
        适合短信、二维码、社交平台分享、老文章换名后兜底。
      </p>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">新建短链</h2>
        <form action={createAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-muted">短码</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-muted">/r/</span>
              <input
                type="text"
                name="code"
                required
                pattern="[\w-]+"
                placeholder="welcome"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm transition focus:border-primary focus:outline-none"
              />
            </div>
          </label>
          <label className="flex flex-[2] flex-col gap-1">
            <span className="text-xs text-muted">目标地址</span>
            <input
              type="url"
              name="toUrl"
              required
              placeholder="https://..."
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-muted">备注</span>
            <input
              type="text"
              name="note"
              placeholder="为什么造这条短链"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            创建
          </button>
        </form>
      </section>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有短链。
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium">短链</th>
                <th className="px-4 py-3 font-medium">目标</th>
                <th className="px-4 py-3 font-medium">命中</th>
                <th className="px-4 py-3 font-medium">备注 / 创建</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-border bg-background">
                  <td className="px-4 py-3 font-mono text-xs">
                    <a
                      href={`/r/${r.code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      /r/{r.code}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <a
                      href={r.toUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all hover:underline"
                    >
                      {r.toUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.hits.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {r.note ? <span>{r.note}</span> : null}
                    {r.note ? <span className="mx-1.5">·</span> : null}
                    {formatDateTimeCN(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteAction(r.id);
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
