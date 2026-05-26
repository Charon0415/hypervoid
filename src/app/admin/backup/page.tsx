import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { countBackups, listBackups } from "@/lib/db-backup";
import { isBlobConfigured } from "@/lib/blob";
import { formatDateTimeCN } from "@/lib/datetime";
import { createBackupAction, deleteBackupAction } from "./actions";

export const metadata: Metadata = {
  title: "数据备份",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default async function AdminBackupPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const blobReady = isBlobConfigured();
  const [list, totals] = await Promise.all([
    blobReady ? listBackups() : Promise.resolve([]),
    blobReady ? countBackups() : Promise.resolve({ count: 0, bytes: 0 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">数据备份</h1>
        <span className="text-sm text-muted">
          {totals.count} 个快照 · 共 {formatBytes(totals.bytes)}
        </span>
      </header>

      {!blobReady ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400">
            ⚠ Vercel Blob 未配置
          </p>
          <p className="mt-1 text-xs text-muted">
            缺少 <code>BLOB_READ_WRITE_TOKEN</code>。在 Vercel 项目存储里创建一个
            Blob store，再把 token 写入 env vars。
          </p>
        </div>
      ) : (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex-1 text-sm text-muted">
            点击「创建快照」立刻把整库导出为 JSON 上传到 Vercel Blob。
            包含 22 张表（posts, postReactions, audit, ai 用量, link-check, search-log 等）。
            URL 含 UUID，不被搜索引擎索引；可任意下载或删除。
          </div>
          <form action={createBackupAction}>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              创建快照
            </button>
          </form>
        </section>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          {blobReady ? "还没有快照。" : ""}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">大小</th>
                <th className="px-4 py-3 font-medium">表行数</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const tableEntries = Object.entries(b.tableCounts ?? {});
                const totalRows = tableEntries.reduce(
                  (sum, [, n]) => sum + (n > 0 ? n : 0),
                  0,
                );
                return (
                  <tr
                    key={b.id}
                    className="border-t border-border bg-background"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatDateTimeCN(b.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatBytes(b.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {tableEntries.length} 张表 ·{" "}
                      <span className="font-mono">
                        {totalRows.toLocaleString("en-US")}
                      </span>{" "}
                      行
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted transition hover:border-primary hover:text-primary"
                        >
                          下载
                        </a>
                        <form
                          action={async () => {
                            "use server";
                            await deleteBackupAction(b.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                          >
                            删除
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
