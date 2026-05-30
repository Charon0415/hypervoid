import Image from "next/image";
import Link from "next/link";
import { listVisibleMessages } from "@/db/guestbook";
import { formatDateCN } from "@/lib/datetime";
import { MessageCircle } from "lucide-react";

function cleanMessage(s: string): string {
  return s.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}

function relativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  return formatDateCN(date);
}

export async function RecentGuestbook() {
  const messages = (await listVisibleMessages()).slice(0, 3);
  if (!messages.length) return null;

  return (
    <div className="hv-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">Guestbook</span>
        </div>
        <Link href="/guestbook" className="text-xs text-muted transition hover:text-accent">
          All →
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 rounded-lg p-2 transition hover:bg-card-hover">
            {m.avatarUrl ? (
              <Image
                src={m.avatarUrl}
                alt=""
                width={24}
                height={24}
                unoptimized={!m.avatarUrl.includes("avatars.githubusercontent.com")}
                className="shrink-0 rounded-full"
              />
            ) : (
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-[10px] text-muted">?</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-foreground">{m.githubLogin || "匿名"}</span>
                <span className="text-[10px] text-muted-soft">{relativeTime(m.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{truncate(cleanMessage(m.message), 60)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
