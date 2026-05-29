import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listFriends, listPendingApplications } from "@/db/friends";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { PendingApplications } from "@/components/admin/PendingApplications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "友链管理",
  robots: { index: false, follow: false },
};

export default async function AdminFriendsList() {
  const [friends, pending] = await Promise.all([
    listFriends(),
    listPendingApplications().catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Link Constellation</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">友链管理</h1>
            <p className="mt-2 text-sm text-muted">共 {friends.length} 个节点，待审核 {pending.length} 条。</p>
          </div>
        </div>
        <Link href="/admin/friends/new" className="hv-action px-4 text-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          添加友链
        </Link>
      </header>

      {pending.length > 0 && <PendingApplications applications={pending} />}

      {friends.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有友链。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((f) => (
            <Link
              key={f.id}
              href={"/admin/friends/" + f.id + "/edit"}
              className="hv-panel hv-panel-hover group flex gap-3 p-4"
            >
              {f.avatar ? (
                <Image
                  src={f.avatar}
                  alt=""
                  width={96}
                  height={96}
                  sizes="48px"
                  loading="lazy"
                  unoptimized
                  className="h-12 w-12 shrink-0 border border-cyan-100/20 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-cyan-100/20 bg-cyan-300/10 font-mono text-sm font-medium text-cyan-100">
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-cyan-50 group-hover:text-white">
                  {f.name}
                </p>
                <p className="truncate font-mono text-xs text-muted">{f.url}</p>
                {f.description ? (
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {f.description}
                  </p>
                ) : null}
              </div>
              <span className="hv-chip shrink-0">#{f.sortOrder}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
