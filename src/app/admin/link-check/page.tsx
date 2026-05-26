import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listLinkChecks } from "@/db/link-checks";
import { formatDateTimeCN } from "@/lib/datetime";
import {
  clearAllAction,
  deleteLinkAction,
  runScanAction,
} from "./actions";

export const metadata: Metadata = {
  title: "失效链接巡检",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function statusBadge(status: number | null, errorMessage: string | null) {
  if (status === null) {
    return {
      label: "ERR",
      cls: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
      hint: errorMessage ?? "请求失败",
    };
  }
  if (status >= 200 && status < 300)
    return {
      label: String(status),
      cls: "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400",
      hint: "OK",
    };
  if (status >= 300 && status < 400)
    return {
      label: String(status),
      cls: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      hint: "重定向",
    };
  return {
    label: String(status),
    cls: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
    hint: status === 404 ? "未找到" : status === 410 ? "已下线" : "错误",
  };
}

export default async function AdminLinkCheckPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const list = await listLinkChecks();
  const broken = list.filter(
    (r) => r.status === null || r.status >= 400 || r.status === 0,
  );
  const lastRun =
    list.length > 0
      ? list.reduce(
          (max, r) =>
            r.lastCheckedAt > max ? r.lastCheckedAt : max,
          list[0].lastCheckedAt,
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">失效链接巡检</h1>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex-1 text-sm text-muted">
          扫描所有已发布公开文章里的外链，并发 6 路，HEAD 失败回退 GET。
          {lastRun ? (
            <>
              {" "}
              · 上次扫描：
              <span className="font-mono text-foreground">
                {formatDateTimeCN(lastRun)}
              </span>
            </>
          ) : null}
          {" "}· 共 {list.length} 个链接 · 异常{" "}
          <span className="font-mono text-red-600 dark:text-red-400">
            {broken.length}
          </span>
        </div>
        <form action={runScanAction}>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            立即扫描
          </button>
        </form>
        {list.length > 0 ? (
          <form action={clearAllAction}>
            <button
              type="submit"
              className="rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-red-500 hover:text-red-500"
            >
              清空历史
            </button>
          </form>
        ) : null}
      </section>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有扫描记录。点上面「立即扫描」开始。
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-3 py-3 font-medium w-16">状态</th>
                <th className="px-3 py-3 font-medium">URL / 错误</th>
                <th className="px-3 py-3 font-medium">出现于</th>
                <th className="px-3 py-3 font-medium">最近检查</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const badge = statusBadge(r.status, r.errorMessage);
                return (
                  <tr
                    key={r.url}
                    className="border-t border-border bg-background"
                  >
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] ${badge.cls}`}
                        title={badge.hint}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all hover:underline"
                      >
                        {r.url}
                      </a>
                      {r.errorMessage ? (
                        <p className="mt-0.5 text-[11px] text-muted">
                          {r.errorMessage}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {(r.postSlugs ?? []).slice(0, 3).map((s, i) => (
                        <span key={s}>
                          <Link
                            href={`/admin/posts/${s}/edit`}
                            className="hover:text-primary"
                          >
                            {s}
                          </Link>
                          {i < Math.min(2, (r.postSlugs ?? []).length - 1)
                            ? "，"
                            : ""}
                        </span>
                      ))}
                      {(r.postSlugs ?? []).length > 3 ? (
                        <span> 等 {(r.postSlugs ?? []).length} 篇</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {formatDateTimeCN(r.lastCheckedAt)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteLinkAction(r.url);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted transition hover:border-red-500 hover:text-red-500"
                        >
                          删除
                        </button>
                      </form>
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
