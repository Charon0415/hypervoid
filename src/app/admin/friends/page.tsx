import Link from "next/link";
import type { Metadata } from "next";
import { listFriends } from "@/db/friends";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "友链管理",
  robots: { index: false, follow: false },
};

export default async function AdminFriendsList() {
  const friends = await listFriends();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <Link
            href="/admin"
            className="text-sm text-muted hover:text-primary"
          >
            ← 后台
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">友链管理</h1>
          <span className="text-sm text-muted">共 {friends.length} 个</span>
        </div>
        <Link
          href="/admin/friends/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + 添加友链
        </Link>
      </header>

      {friends.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有友链。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((f) => (
            <Link
              key={f.id}
              href={`/admin/friends/${f.id}/edit`}
              className="group flex gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary"
            >
              {f.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.avatar}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold group-hover:text-primary">
                  {f.name}
                </p>
                <p className="truncate text-xs text-muted">{f.url}</p>
                {f.description ? (
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {f.description}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-muted">
                #{f.sortOrder}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
