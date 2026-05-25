import type { Metadata } from "next";
import Image from "next/image";
import { listFriends } from "@/db/friends";
import { FriendApplyForm } from "@/components/FriendApplyForm";

export const revalidate = 60;

export const metadata: Metadata = { title: "友链", description: "Charon 的朋友们——串门的博客与站点" };

export default async function FriendsPage() {
  const friends = await listFriends();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">友链</h1>
        <p className="mt-2 text-muted">朋友们的博客与个人站点。</p>
      </header>
      {friends.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          暂无友链。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((f) => (
            <a
              key={f.id}
              href={f.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
            >
              {f.avatar ? (
                <Image
                  src={f.avatar}
                  alt=""
                  width={112}
                  height={112}
                  sizes="56px"
                  loading="lazy"
                  unoptimized
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold group-hover:text-primary">
                  {f.name}
                </p>
                {f.description ? (
                  <p className="mt-0.5 text-sm text-muted">{f.description}</p>
                ) : null}
                <p className="mt-1 truncate text-xs text-muted">{f.url}</p>
              </div>
            </a>
          ))}
        </div>
      )}
      <FriendApplyForm />
    </div>
  );
}
