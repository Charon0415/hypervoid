import Link from "next/link";
import { listVisibleMessages } from "@/db/guestbook";

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
  return date.toISOString().slice(0, 10);
}

export async function RecentGuestbook() {
  const messages = (await listVisibleMessages()).slice(0, 5);
  if (!messages.length) return null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
          近期留言
        </h3>
        <Link href="/guestbook" className="text-xs text-muted hover:text-primary">
          全部 →
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="flex items-start gap-2.5">
            {m.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.avatarUrl}
                alt=""
                width={28}
                height={28}
                className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-border bg-background" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate font-medium text-foreground">
                  {m.githubName ?? m.githubLogin}
                </span>
                <span className="shrink-0 text-muted">
                  {relativeTime(m.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-snug text-muted">
                {truncate(m.message, 60)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
