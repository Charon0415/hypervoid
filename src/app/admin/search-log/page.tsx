import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { countSearchLog, listTopQueries } from "@/db/search-log";
import { formatDateTimeCN } from "@/lib/datetime";
import { clearSearchLogAction } from "./actions";

export const metadata: Metadata = {
  title: "搜索分析",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DEFAULT_WINDOW = 30;

export default async function AdminSearchLogPage(props: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const sp = await props.searchParams;
  const days = Math.max(1, Math.min(365, Number(sp.days) || DEFAULT_WINDOW));

  const [counters, top, zero] = await Promise.all([
    countSearchLog(days),
    listTopQueries({ sinceDays: days, limit: 30 }),
    listTopQueries({ sinceDays: days, limit: 30, zeroOnly: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">搜索分析</h1>
        <span className="text-sm text-muted">最近 {days} 天</span>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-1 flex-wrap gap-4">
          <Stat label="总查询数" value={counters.total} />
          <Stat label="不同查询" value={counters.distinctQueries} />
          <Stat
            label="零结果"
            value={counters.zero}
            tone={counters.zero > 0 ? "warn" : undefined}
          />
        </div>
        <div className="flex gap-2 text-xs">
          {[7, 30, 90, 365].map((d) => (
            <Link
              key={d}
              href={`/admin/search-log?days=${d}`}
              className={`rounded-md border px-2 py-1 transition ${
                d === days
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted hover:border-primary/40"
              }`}
            >
              {d} 天
            </Link>
          ))}
        </div>
        <form action={clearSearchLogAction}>
          <button
            type="submit"
            className="rounded-md border border-border bg-card px-3 py-2 text-xs transition hover:border-red-500 hover:text-red-500"
          >
            清空日志
          </button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <QueryTable
          title="热门查询"
          rows={top}
          emptyHint="还没有任何搜索记录。"
        />
        <QueryTable
          title="⚠ 零结果查询"
          rows={zero}
          emptyHint="没有零结果查询 — 太棒了。"
          highlight
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn";
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p
        className={`mt-0.5 font-mono text-2xl font-bold leading-tight ${
          tone === "warn"
            ? "text-amber-600 dark:text-amber-400"
            : "text-foreground"
        }`}
      >
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function QueryTable({
  title,
  rows,
  emptyHint,
  highlight,
}: {
  title: string;
  rows: {
    query: string;
    hits: number;
    uniqueIps: number;
    zeroResultHits: number;
    lastSeen: Date;
  }[];
  emptyHint: string;
  highlight?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <h2 className="border-b border-border px-4 py-3 text-sm font-semibold tracking-tight">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="p-6 text-center text-xs text-muted">{emptyHint}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">查询</th>
              <th className="px-2 py-2 font-medium">命中</th>
              <th className="px-2 py-2 font-medium">独立 IP</th>
              <th className="px-2 py-2 font-medium">最近</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.query}
                className={`border-t border-border ${
                  highlight ? "bg-amber-500/[0.02]" : ""
                }`}
              >
                <td className="px-4 py-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(r.query)}`}
                    className="break-all hover:text-primary"
                  >
                    {r.query}
                  </Link>
                </td>
                <td className="px-2 py-2 font-mono text-xs">{r.hits}</td>
                <td className="px-2 py-2 font-mono text-xs text-muted">
                  {r.uniqueIps}
                </td>
                <td className="px-2 py-2 font-mono text-[11px] text-muted">
                  {formatDateTimeCN(r.lastSeen)}
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
