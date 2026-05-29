import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Link2, Plus, Trash2 } from "lucide-react";
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
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Redirect Router</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">短链管理</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              访问 <code>{siteConfig.url}/r/&lt;短码&gt;</code> 会 307 跳转到目标地址并累计命中。
            </p>
          </div>
        </div>
        <span className="hv-chip">共 {list.length} 条</span>
      </header>

      <section className="hv-panel p-5">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-cyan-100/70" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-tight text-cyan-50">新建短链</h2>
        </div>
        <form action={createAction} className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_2fr_1.2fr_auto] lg:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">短码</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-muted">/r/</span>
              <input type="text" name="code" required pattern="[\w-]+" placeholder="welcome" className="hv-input min-h-11 flex-1 px-3 font-mono text-sm" />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">目标地址</span>
            <input type="url" name="toUrl" required placeholder="https://..." className="hv-input min-h-11 px-3 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">备注</span>
            <input type="text" name="note" placeholder="为什么造这条短链" className="hv-input min-h-11 px-3 text-sm" />
          </label>
          <button type="submit" className="hv-action px-4 text-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            创建
          </button>
        </form>
      </section>

      {list.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有短链。
        </p>
      ) : (
        <div className="hv-panel overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-cyan-200/10 bg-cyan-300/[0.04] text-left text-xs uppercase text-cyan-100/65">
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
                <tr key={r.id} className="border-t border-cyan-200/10 transition hover:bg-cyan-300/[0.035]">
                  <td className="px-4 py-3 font-mono text-xs">
                    <a href={"/r/" + r.code} target="_blank" rel="noreferrer" className="text-cyan-100 hover:text-white">
                      /r/{r.code}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <a href={r.toUrl} target="_blank" rel="noreferrer" className="break-all text-cyan-50/80 hover:text-white">
                      {r.toUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-cyan-50">{r.hits.toLocaleString("en-US")}</td>
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
                      <button type="submit" className="inline-flex items-center gap-1 border border-red-400/35 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 transition hover:border-red-300 hover:bg-red-500/15">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
