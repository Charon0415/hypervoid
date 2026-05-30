import Link from "next/link";
import { Folder, PenLine } from "lucide-react";
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
      <header className="hv-panel-sci relative overflow-hidden p-5 sm:p-6 flex items-center justify-between gap-3">
        {/* Corner accents */}
        <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-accent/60 pointer-events-none" />
        <div className="absolute right-0 bottom-0 h-10 w-10 border-r-2 border-b-2 border-accent/60 pointer-events-none" />

        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="hv-title font-mono text-2xl font-black tracking-wider uppercase">POST_MANAGER</h1>
          <span className="font-mono text-sm text-muted uppercase">
            {allPosts.length} POSTS · {categories.length} CATS
          </span>
        </div>
        <Link
          href="/admin/posts/new"
          className="hv-action px-4 py-2 text-sm font-medium font-mono uppercase clip-path-[polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:shadow-[0_0_20px_var(--accent-glow)]"
        >
          <PenLine className="h-4 w-4" aria-hidden />
          NEW_POST
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hv-panel-sci flex flex-col gap-1 p-3 text-sm">
          <p className="hv-kicker mb-1 flex items-center gap-1 px-2 uppercase">
            <Folder className="h-3.5 w-3.5" aria-hidden /> CATEGORIES
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
      className={`flex items-center justify-between px-2 py-1.5 transition clip-path-[polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,0_100%)] ${
        active
          ? "bg-accent/12 text-foreground border-l-2 border-accent"
          : "text-foreground hover:bg-accent/5 hover:text-foreground"
      } ${muted && !active ? "italic text-muted" : ""}`}
    >
      <span className="truncate">{label}</span>
      <span className="ml-2 shrink-0 font-mono text-[10px] opacity-70">
        {count}
      </span>
    </Link>
  );
}
