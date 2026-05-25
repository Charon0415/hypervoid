import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import {
  listMonthlyPostCounts,
  listTopPostsByLikes,
  listTopPostsByViews,
} from "@/db/analytics";
import { getSiteStats } from "@/lib/stats";
import { countActiveSubscribers } from "@/lib/newsletter";
import { formatDateCN } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "数据看板",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const [stats, subs, topViews, topLikes, monthly] = await Promise.all([
    getSiteStats({ isAdmin: true }),
    countActiveSubscribers(),
    listTopPostsByViews(10),
    listTopPostsByLikes(10),
    listMonthlyPostCounts(12),
  ]);

  const maxMonthly = Math.max(1, ...monthly.map((m) => m.count));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">数据看板</h1>
      </header>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        <BigStat label="已发布" value={stats.posts} />
        <BigStat label="总浏览" value={stats.views} />
        <BigStat label="总点赞" value={stats.likes} />
        <BigStat label="订阅者" value={subs} />
        <BigStat label="在线天数" value={stats.daysOnline} />
      </section>

      {/* Monthly bar chart — pure CSS */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          近 12 个月发文趋势
        </h2>
        <div className="mt-5 flex h-44 items-end gap-2">
          {monthly.map((m) => {
            const heightPct = (m.count / maxMonthly) * 100;
            const isThisMonth =
              m.month ===
              `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
            return (
              <div
                key={m.month}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1"
                title={`${m.month} · ${m.count} 篇`}
              >
                <div
                  className={`w-full rounded-t transition ${
                    m.count === 0
                      ? "bg-muted/15"
                      : isThisMonth
                        ? "bg-primary"
                        : "bg-primary/55 group-hover:bg-primary"
                  }`}
                  style={{ height: `${Math.max(2, heightPct)}%` }}
                />
                <span className="text-[9px] font-mono text-muted">
                  {m.month.slice(5)}
                </span>
                <span className="absolute -top-5 hidden font-mono text-[10px] text-foreground/80 group-hover:block">
                  {m.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TopList
          title="最热门（按浏览）"
          rows={topViews}
          metricKey="views"
          metricLabel="浏览"
        />
        <TopList
          title="最受赞（按点赞）"
          rows={topLikes}
          metricKey="likes"
          metricLabel="点赞"
        />
      </section>

      <p className="text-xs text-muted">
        实时从数据库读取。访问量来自服务端计数（每次完整渲染 +1），点赞来自访客手动操作。
      </p>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold leading-tight sm:text-3xl">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function TopList({
  title,
  rows,
  metricKey,
  metricLabel,
}: {
  title: string;
  rows: {
    slug: string;
    title: string;
    views: number;
    likes: number;
    publishAt: Date | null;
  }[];
  metricKey: "views" | "likes";
  metricLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">还没有数据。</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li
              key={r.slug}
              className="flex items-baseline gap-3 rounded-md px-2 py-1.5 transition hover:bg-background"
            >
              <span className="w-5 shrink-0 text-right font-mono text-xs text-muted">
                {i + 1}
              </span>
              <Link
                href={`/posts/${r.slug}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm hover:text-primary"
              >
                {r.title}
              </Link>
              <span className="shrink-0 font-mono text-xs">
                <span className="font-bold">{r[metricKey].toLocaleString("en-US")}</span>{" "}
                <span className="text-muted">{metricLabel}</span>
              </span>
              <time className="hidden shrink-0 font-mono text-[10px] text-muted sm:inline">
                {r.publishAt ? formatDateCN(r.publishAt) : "—"}
              </time>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
