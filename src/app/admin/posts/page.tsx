import Link from "next/link";
import type { Metadata } from "next";
import { listAllPosts } from "@/db/admin-posts";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

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

export default async function AdminPostsList() {
  const posts = await listAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">文章管理</h1>
          <span className="text-sm text-muted">共 {posts.length} 篇</span>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + 新建文章
        </Link>
      </header>

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
                  还没有文章。点右上角新建。
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
                        ? post.publishAt.toISOString().slice(0, 16).replace("T", " ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {post.updatedAt.toISOString().slice(0, 10)}
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
  );
}
