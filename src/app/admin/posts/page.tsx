import Link from "next/link";
import type { Metadata } from "next";
import { listAllPosts } from "@/db/admin-posts";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { formatDateCN, formatDateTimeCN } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "文章管理",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  scheduled: "定时",
  published: "已发布",
};

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
  scheduled: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

const UNCATEGORIZED = "__uncategorized__";

function effectiveStatus(
  status: string,
  publishAt: Date | null,
): { key: string; suffix: string } {
  if (status === "scheduled" && publishAt && publishAt.getTime() <= Date.now()) {
    return { key: "published", suffix: " · 来自定时" };
  }
  return { key: status, suffix: "" };
}

export const dynamic = "force-dynamic";

export default async function AdminPostsList(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await props.searchParams;
  const activeCategory = rawCategory?.trim() || "";

  const allPosts = await listAllPosts();

  const byCategory = new Map<string, number>();
  for (const p of allPosts) {
    const key = p.category?.trim() || UNCATEGORIZED;
    byCategory.set(key, (byCategory.get(key) ?? 0) + 1);
  }
  const categories = [...byCategory.entries()]
    .sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1;
      if (b[0] === UNCATEGORIZED) return -1;
      return b[1] - a[1];
    });

  const posts = activeCategory
    ? allPosts.filter((p) => {
        const cat = p.category?.trim() || UNCATEGORIZED;
        return cat === activeCategory;
      })
    : allPosts;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">文章管理</h1>
          <span className="text-sm text-muted">
            共 {allPosts.length} 篇 · {categories.length} 个分类
          </span>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + 新建文章
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-1 text-sm">
          <p className="mb-1 px-2 text-[10px] uppercase tracking-widest text-muted">
            📁 分类
          </p>
          <CategoryLink
            href="/admin/posts"
            label="全部"
            count={allPosts.length}
            active={!activeCategory}
          />
          {categories.map(([cat, count]) => (
            <CategoryLink
              key={cat}
              href={`/admin/posts?category=${encodeURIComponent(cat)}`}
              label={cat === UNCATEGORIZED ? "未分类" : cat}
              count={count}
              active={activeCategory === cat}
              muted={cat === UNCATEGORIZED}
            />
          ))}
          <p className="mt-3 px-2 text-[10px] leading-snug text-muted">
            分类来自每篇文章的 <code>category</code> 字段。在编辑页修改。
          </p>
        </aside>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">发布时间</th>
                <th className="px-4 py-3 font-medium">更新</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted"
                  >
                    {activeCategory
                      ? `分类「${activeCategory === UNCATEGORIZED ? "未分类" : activeCategory}」下还没有文章。`
                      : "还没有文章。点右上角新建。"}
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const eff = effectiveStatus(post.status, post.publishAt);
                  return (
                    <tr
                      key={post.slug}
                      className="border-t border-border bg-background"
                    >
                      <td className="px-4 py-3 font-medium">
                        {post.visibility === "private" ? (
                          <span title="私密" className="mr-1">
                            🔒
                          </span>
                        ) : null}
                        {post.title}
                        {post.category ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                            {post.category}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {post.slug}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[eff.key]}`}
                        >
                          {STATUS_LABEL[eff.key]}
                          {eff.suffix ? (
                            <span className="text-muted">{eff.suffix}</span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {post.publishAt
                          ? formatDateTimeCN(post.publishAt)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {formatDateCN(post.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/posts/${post.slug}/edit`}
                          className="text-primary hover:underline"
                        >
                          编辑
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoryLink({
  href,
  label,
  count,
  active,
  muted,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-md px-2 py-1.5 transition ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:bg-card"
      } ${muted && !active ? "italic text-muted" : ""}`}
    >
      <span className="truncate">{label}</span>
      <span className="ml-2 shrink-0 font-mono text-[10px] opacity-70">
        {count}
      </span>
    </Link>
  );
}
