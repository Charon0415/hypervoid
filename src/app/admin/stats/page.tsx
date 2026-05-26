import Image from "next/image";
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
import {
  countVisitorLogins,
  listVisitorLogins,
  type VisitorLogin,
} from "@/db/visitor-logins";
import { getSiteStats } from "@/lib/stats";
import { countActiveSubscribers } from "@/lib/newsletter";
import { formatDateCN, formatDateTimeCN } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "数据看板",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const [
    stats,
    subs,
    topViews,
    topLikes,
    monthly,
    visitors,
    visitorCount,
  ] = await Promise.all([
    getSiteStats({ isAdmin: true }).catch(() => ({
      posts: 0, views: 0, likes: 0, daysOnline: 1,
    })),
    countActiveSubscribers().catch(() => 0),
    listTopPostsByViews(10).catch(() => []),
    listTopPostsByLikes(10).catch(() => []),
    listMonthlyPostCounts(12).catch(() => []),
    listVisitorLogins(50).catch(() => []),
    countVisitorLogins().catch(() => 0),
  ]);

  const maxMonthly = Math.max(1, ...monthly.map((m) => m.count));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">数据看板</h1>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <BigStat label="已发布" value={stats.posts} />
        <BigStat label="总浏览" value={stats.views} />
        <BigStat label="总点赞" value={stats.likes} />
        <BigStat label="订阅者" value={subs} />
        <BigStat label="在线天数" value={stats.daysOnline} />
      </section>

      {/* Monthly bar chart — pure CSS */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          近 12 个月发文趋势
        </h2>
        <div className="mt-4 flex h-36 items-end gap-1 sm:mt-5 sm:h-44 sm:gap-2">
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
                <span className="text-[8px] font-mono text-muted sm:text-[9px]">
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

      <VisitorList rows={visitors} total={visitorCount} />

      <p className="text-xs text-muted">
        实时从数据库读取。访问量来自服务端计数（每次完整渲染 +1），点赞来自访客手动操作。
      </p>
    </div>
  );
}

function VisitorList({
  rows,
  total,
}: {
  rows: VisitorLogin[];
  total: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-1.5">
        <h2 className="text-sm font-semibold tracking-tight">
          访客记录
          <span className="ml-2 font-mono text-xs font-normal text-muted">
            共 {total} 个 GitHub 账号
          </span>
        </h2>
        <p className="text-[10px] text-muted">按最近登录时间排序 · 上限 50</p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          还没有访客登录过博客。
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {rows.map((v) => (
            <li
              key={v.githubLogin}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-background sm:py-1.5"
            >
              {v.avatarUrl ? (
                <Image
                  src={v.avatarUrl}
                  alt={`${v.githubLogin}的头像`}
                  width={72}
                  height={72}
                  sizes="36px"
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full sm:h-7 sm:w-7"
                />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted/20 sm:h-7 sm:w-7" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <span className="truncate text-sm">
                  {v.githubName ?? v.githubLogin}
                </span>
                <Link
                  href={`https://github.com/${v.githubLogin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 truncate font-mono text-[11px] text-muted hover:text-primary sm:text-xs"
                >
                  @{v.githubLogin}
                </Link>
                <time className="font-mono text-[10px] text-muted/80 sm:hidden">
                  {formatDateTimeCN(v.lastSeenAt)}
                </time>
              </div>
              <span className="shrink-0 font-mono text-xs">
                <span className="font-bold">{v.loginCount}</span>
                <span className="ml-0.5 text-muted">次</span>
              </span>
              <time className="hidden shrink-0 font-mono text-[10px] text-muted sm:inline">
                {formatDateTimeCN(v.lastSeenAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">还没有数据。</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li
              key={r.slug}
              className="flex items-baseline gap-2 rounded-md px-2 py-1.5 transition hover:bg-background sm:gap-3"
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
