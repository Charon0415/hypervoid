import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GitMerge, Pencil, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listTagsWithUsage } from "@/db/tag-admin";
import { deleteTagAction, mergeTagsAction, renameTagAction } from "./actions";

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
      <header className="hv-panel p-5">
        <AdminBackLink href="/admin" label="后台" />
        <p className="hv-kicker mt-4">Tag Operations</p>
        <h1 className="hv-title mt-1 text-2xl font-semibold">标签管理</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          改一处生效全站：重命名、合并、删除都会扫过所有文章并写入 audit。操作不可逆，建议先在 <Link href="/admin/backup" className="text-cyan-100 hover:text-white">/admin/backup</Link> 做一次快照。
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="hv-panel p-5">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-cyan-100/70" aria-hidden="true" />
            <h2 className="text-sm font-semibold tracking-tight text-cyan-50">重命名</h2>
          </div>
          <form action={renameTagAction} className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">原标签</span>
              <select name="oldName" required defaultValue="" className="hv-input min-h-11 px-3 text-sm">
                <option value="" disabled>选一个标签…</option>
                {tags.map((t) => <option key={t.name} value={t.name}>{t.name} ({t.count})</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">新标签名</span>
              <input type="text" name="newName" required placeholder="新名字" className="hv-input min-h-11 px-3 text-sm" />
            </label>
            <button type="submit" className="hv-action self-start px-4 text-sm">重命名</button>
          </form>
        </div>

        <div className="hv-panel p-5">
          <div className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-cyan-100/70" aria-hidden="true" />
            <h2 className="text-sm font-semibold tracking-tight text-cyan-50">合并到</h2>
          </div>
          <p className="mt-2 text-xs text-muted">勾选下方一个或多个标签，全部并入目标标签，重复会去重。</p>
          <form action={mergeTagsAction} className="mt-3 flex flex-col gap-3" id="merge-form">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">目标标签名</span>
              <input type="text" name="target" required placeholder="如：JavaScript" className="hv-input min-h-11 px-3 text-sm" />
            </label>
            <button type="submit" className="hv-action self-start px-4 text-sm">合并所选</button>
          </form>
        </div>
      </section>

      {tags.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">还没有标签。</p>
      ) : (
        <div className="hv-panel overflow-x-auto p-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-cyan-200/10 bg-cyan-300/[0.04] text-left text-xs uppercase text-cyan-100/65">
              <tr>
                <th className="w-10 px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">标签</th>
                <th className="px-4 py-3 font-medium">文章数</th>
                <th className="px-4 py-3 font-medium">出现于</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr key={t.name} className="border-t border-cyan-200/10 transition hover:bg-cyan-300/[0.035]">
                  <td className="px-4 py-3"><input type="checkbox" name="sources" value={t.name} form="merge-form" className="h-4 w-4 accent-cyan-300" /></td>
                  <td className="px-4 py-3 font-medium text-cyan-50">#{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-cyan-50">{t.count}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {t.slugs.slice(0, 3).map((s, i) => (
                      <span key={s}>
                        <Link href={"/admin/posts/" + s + "/edit"} className="hover:text-cyan-50">{s}</Link>
                        {i < Math.min(2, t.slugs.length - 1) ? "，" : ""}
                      </span>
                    ))}
                    {t.slugs.length > 3 ? <span> 等 {t.slugs.length} 篇</span> : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={async () => { "use server"; await deleteTagAction(t.name); }}>
                      <button type="submit" className="inline-flex items-center gap-1 border border-red-400/35 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 transition hover:border-red-300 hover:bg-red-500/15">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />删除
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
