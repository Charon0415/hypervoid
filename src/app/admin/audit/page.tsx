import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getAuditFacets, listAuditLog } from "@/lib/audit";
import { formatDateTimeCN } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "操作审计",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "post.create": "新建文章",
  "post.update": "编辑文章",
  "post.delete": "删除文章",
  "announcement.create": "新建公告",
  "announcement.update": "编辑公告",
  "announcement.delete": "删除公告",
  "announcement.toggle": "切换公告",
  "redirect.create": "新建短链",
  "redirect.delete": "删除短链",
  "guestbook.hide": "隐藏留言",
  "guestbook.unhide": "恢复留言",
  "guestbook.delete": "删除留言",
  "subscriber.delete": "删除订阅",
  "subscriber.unsubscribe": "强制退订",
  "subscriber.restore": "恢复订阅",
  "theme.save": "保存自定义主题",
  "media.delete": "删除图片",
};

const COLOR_BY_PREFIX: Record<string, string> = {
  post: "emerald",
  announcement: "indigo",
  redirect: "violet",
  guestbook: "amber",
  subscriber: "sky",
  theme: "fuchsia",
  media: "rose",
};

function colorFor(action: string): string {
  const prefix = action.split(".")[0];
  return COLOR_BY_PREFIX[prefix] ?? "zinc";
}

export default async function AdminAuditPage(props: {
  searchParams: Promise<{
    actor?: string;
    prefix?: string;
    target?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const sp = await props.searchParams;
  const filters = {
    actor: sp.actor?.trim() || undefined,
    actionPrefix: sp.prefix?.trim() || undefined,
    targetType: sp.target?.trim() || undefined,
  };

  const [log, facets] = await Promise.all([
    listAuditLog(300, filters),
    getAuditFacets(),
  ]);

  const buildHref = (override: Partial<typeof sp>) => {
    const next = { ...sp, ...override };
    const params = new URLSearchParams();
    if (next.actor) params.set("actor", next.actor);
    if (next.prefix) params.set("prefix", next.prefix);
    if (next.target) params.set("target", next.target);
    const qs = params.toString();
    return qs ? `/admin/audit?${qs}` : "/admin/audit";
  };
  const activeCount =
    (filters.actor ? 1 : 0) +
    (filters.actionPrefix ? 1 : 0) +
    (filters.targetType ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">操作审计</h1>
        <span className="text-sm text-muted">
          {activeCount > 0 ? `${log.length} 条过滤结果` : `最近 ${log.length} 条`}
        </span>
      </header>

      <p className="text-sm text-muted">
        所有改动数据库或外部资源的后台操作都会留痕。仅追加，不可编辑。
      </p>

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-muted">操作人：</span>
          <FilterChip
            href={buildHref({ actor: undefined })}
            active={!filters.actor}
            label="全部"
          />
          {facets.actors.map((a) => (
            <FilterChip
              key={a}
              href={buildHref({ actor: filters.actor === a ? undefined : a })}
              active={filters.actor === a}
              label={`@${a}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-muted">动作类别：</span>
          <FilterChip
            href={buildHref({ prefix: undefined })}
            active={!filters.actionPrefix}
            label="全部"
          />
          {facets.actionPrefixes.map((p) => (
            <FilterChip
              key={p}
              href={buildHref({
                prefix: filters.actionPrefix === p ? undefined : p,
              })}
              active={filters.actionPrefix === p}
              label={p}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-muted">目标类型：</span>
          <FilterChip
            href={buildHref({ target: undefined })}
            active={!filters.targetType}
            label="全部"
          />
          {facets.targetTypes.map((t) => (
            <FilterChip
              key={t}
              href={buildHref({ target: filters.targetType === t ? undefined : t })}
              active={filters.targetType === t}
              label={t}
            />
          ))}
        </div>
      </section>

      {log.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有审计记录。
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {log.map((row) => {
            const color = colorFor(row.action);
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <time className="shrink-0 font-mono text-[11px] text-muted">
                  {formatDateTimeCN(row.createdAt)}
                </time>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium bg-${color}-500/10 text-${color}-700 dark:text-${color}-300`}
                  style={{
                    background: `color-mix(in srgb, var(--primary) 10%, transparent)`,
                    color: `var(--primary)`,
                  }}
                  title={row.action}
                >
                  {ACTION_LABEL[row.action] ?? row.action}
                </span>
                <span className="font-mono text-xs text-muted">@{row.actor}</span>
                {row.targetType ? (
                  <span className="font-mono text-xs text-muted">
                    {row.targetType}
                    {row.targetId ? ` · ${row.targetId.slice(0, 32)}` : ""}
                  </span>
                ) : null}
                {row.details ? (
                  <details className="ml-auto text-[11px] text-muted">
                    <summary className="cursor-pointer hover:text-foreground">
                      详情
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-background p-2 font-mono text-[10px]">
                      {JSON.stringify(row.details, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
