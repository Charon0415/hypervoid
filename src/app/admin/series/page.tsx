import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listAllSeries } from "@/db/series-admin";
import { listAllPosts } from "@/db/admin-posts";
import {
  createSeriesAction,
  updateSeriesAction,
  deleteSeriesAction,
  assignPostToSeriesAction,
} from "./actions";

export const metadata: Metadata = {
  title: "专题合集",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const [series, allPosts] = await Promise.all([
    listAllSeries(),
    listAllPosts(),
  ]);

  const assignedSlugs = new Set(
    series.flatMap((s) => s.posts.map((p) => p.slug)),
  );
  const unassigned = allPosts.filter(
    (p) => !assignedSlugs.has(p.slug) && p.status === "published",
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="hv-panel p-5">
        <AdminBackLink href="/admin" label="后台" />
        <p className="hv-kicker mt-4">Series Registry</p>
        <h1 className="hv-title mt-1 text-2xl font-semibold">专题合集</h1>
        <p className="mt-2 text-sm text-muted">共 {series.length} 个系列。管理文章专题、分组和排序。</p>
      </header>

      <p className="text-sm text-muted">
        系列名会同步到文章的 frontmatter 字段。
      </p>

      {/* Create new series */}
      <section className="hv-panel p-5">
        <h2 className="text-sm font-semibold tracking-tight text-cyan-50">创建新系列</h2>
        <form action={createSeriesAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">系列名称 *</span>
            <input
              type="text"
              name="name"
              required
              placeholder="如：Next.js 实战"
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">URL slug *</span>
            <input
              type="text"
              name="slug"
              required
              pattern="[a-z0-9][a-z0-9-]*"
              placeholder="如：nextjs-practice"
              className="hv-input min-h-11 px-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">简介（可选）</span>
            <input
              type="text"
              name="description"
              placeholder="一句话描述这个系列"
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">封面图 URL（可选）</span>
            <input
              type="text"
              name="cover"
              placeholder="/images/series-cover.jpg 或外部 URL"
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="hv-action px-5 text-sm font-medium"
            >
              创建系列
            </button>
          </div>
        </form>
      </section>

      {/* Series list */}
      {series.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有任何系列。使用上方表单创建第一个。
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {series.map((s) => (
            <SeriesCard key={s.slug} series={s} unassignedPosts={unassigned} />
          ))}
        </div>
      )}
    </div>
  );
}

function SeriesCard({
  series: s,
  unassignedPosts,
}: {
  series: Awaited<ReturnType<typeof listAllSeries>>[number];
  unassignedPosts: Awaited<ReturnType<typeof listAllPosts>>;
}) {
  return (
    <div className="hv-panel p-5">
      {/* Header with edit form */}
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold tracking-tight text-cyan-50">{s.name}</h2>
            <span className="font-mono text-xs text-muted">/{s.slug}</span>
            <span className="font-mono text-xs text-muted">{s.count} 篇</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/series/${encodeURIComponent(s.name)}`}
              className="hv-action min-h-0 px-2.5 py-1 text-[11px]"
            >
              前台查看
            </Link>
            <span className="text-[11px] text-muted group-open:hidden">展开编辑</span>
            <span className="hidden text-[11px] text-muted group-open:inline">收起</span>
          </div>
        </summary>

        <form action={updateSeriesAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="oldSlug" value={s.slug} />
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">系列名称</span>
            <input
              type="text"
              name="name"
              defaultValue={s.name}
              required
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">URL slug</span>
            <input
              type="text"
              name="slug"
              defaultValue={s.slug}
              required
              pattern="[a-z0-9][a-z0-9-]*"
              className="hv-input min-h-11 px-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">简介</span>
            <input
              type="text"
              name="description"
              defaultValue={s.description ?? ""}
              placeholder="一句话描述"
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted">封面图 URL</span>
            <input
              type="text"
              name="cover"
              defaultValue={s.cover ?? ""}
              placeholder="/images/cover.jpg"
              className="hv-input min-h-11 px-3 text-sm"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="hv-action px-4 text-sm font-medium"
            >
              保存修改
            </button>
            <form
              action={async () => {
                "use server";
                await deleteSeriesAction(s.slug);
              }}
            >
              <button
                type="submit"
                className="border border-red-400/35 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:border-red-300 hover:bg-red-500/15"
              >
                删除系列
              </button>
            </form>
          </div>
        </form>
      </details>

      {/* Posts in this series */}
      <div className="mt-4">
        <h3 className="text-xs font-medium text-muted">系列内文章</h3>
        {s.posts.length === 0 ? (
          <p className="mt-2 text-xs text-muted">暂无文章。在下方添加。</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {s.posts.map((p, i) => (
              <li
                key={p.slug}
                className="flex items-center gap-2 border border-transparent px-2 py-1.5 text-sm transition hover:border-cyan-100/12 hover:bg-cyan-300/[0.035]"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-cyan-100/20 bg-cyan-300/10 font-mono text-[10px] text-cyan-100">
                  {p.seriesOrder ?? i + 1}
                </span>
                <Link
                  href={`/admin/posts/${p.slug}/edit`}
                  className="min-w-0 flex-1 truncate text-cyan-50/86 hover:text-white"
                >
                  {p.title}
                </Link>
                <form action={async () => {
                  "use server";
                  await assignPostToSeriesAction(p.slug, null);
                }}>
                  <button
                    type="submit"
                    className="shrink-0 border border-red-400/25 bg-red-500/5 px-1.5 py-0.5 text-[10px] text-red-200 transition hover:border-red-300"
                    title="从系列中移除"
                  >
                    移除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* Add post to series */}
        {unassignedPosts.length > 0 && (
          <form
            action={async (fd: FormData) => {
              "use server";
              const postSlug = String(fd.get("postSlug") ?? "");
              if (postSlug) await assignPostToSeriesAction(postSlug, s.name);
            }}
            className="mt-3 flex gap-2"
          >
            <select
              name="postSlug"
              required
              defaultValue=""
              className="hv-input flex-1 px-3 py-1.5 text-sm"
            >
              <option value="" disabled>
                添加文章到此系列…
              </option>
              {unassignedPosts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="hv-action min-h-0 px-3 py-1.5 text-sm"
            >
              添加
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
