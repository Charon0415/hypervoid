import Link from "next/link";
import type { Metadata } from "next";
import { listAllPosts } from "@/db/admin-posts";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { PostsTable, type PostRow } from "@/components/admin/PostsTable";

export const metadata: Metadata = {
  title: "文章管理",
  robots: { index: false, follow: false },
};

const UNCATEGORIZED = "__uncategorized__";

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
  const categories = [...byCategory.entries()].sort((a, b) => {
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

        <PostsTable
          posts={posts.map<PostRow>((p) => ({
            slug: p.slug,
            title: p.title,
            category: p.category ?? null,
            status: p.status,
            visibility: p.visibility,
            pinned: p.pinned,
            publishAt: p.publishAt,
            updatedAt: p.updatedAt,
          }))}
          activeCategoryEmpty={Boolean(activeCategory)}
        />
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
