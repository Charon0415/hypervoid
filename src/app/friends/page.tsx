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
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div aria-hidden className="absolute left-0 top-0 h-8 w-8 border-l border-t border-cyan-400/40" />
        <div aria-hidden className="absolute right-0 top-0 h-2 w-2 rounded-full bg-cyan-400/60 animate-pulse" />
        <p className="hv-kicker">Friend_Links / Network_Nodes</p>
        <h1 className="hv-title mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
          友链
        </h1>
        <p className="mt-3 text-sm text-cyan-50/68">
          朋友们的博客与个人站点。
        </p>
      </header>
      {friends.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-cyan-50/60">
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
              className="group hv-card flex gap-3 p-5 transition-all duration-300"
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
                  className="h-14 w-14 shrink-0 rounded-full border border-cyan-100/20 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-100/30 bg-cyan-400/10 text-lg font-medium text-cyan-100">
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-cyan-50 group-hover:text-cyan-100 transition">
                  {f.name}
                </p>
                {f.description ? (
                  <p className="mt-0.5 text-sm text-cyan-50/68">{f.description}</p>
                ) : null}
                <p className="mt-1 truncate font-mono text-xs text-cyan-50/48">{f.url}</p>
              </div>
            </a>
          ))}
        </div>
      )}
      <FriendApplyForm />
    </div>
  );
}
