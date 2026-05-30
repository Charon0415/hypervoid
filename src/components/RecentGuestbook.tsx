import Image from "next/image";
import Link from "next/link";
import { listVisibleMessages } from "@/db/guestbook";
import { formatDateCN } from "@/lib/datetime";

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
  const messages = (await listVisibleMessages()).slice(0, 5);
  if (!messages.length) return null;

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-5">
      {/* Corner accent */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100/80">
          Guestbook
        </h3>
        <Link
          href="/guestbook"
          className="group inline-flex items-center gap-1 border border-cyan-100/18 bg-cyan-950/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-100/70 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300"
          style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}
        >
          All
          <svg
            aria-hidden
            className="h-3 w-3 transition group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="group/msg flex items-start gap-2.5 border-l border-cyan-100/10 pl-3 transition hover:border-cyan-400/40">
            {m.avatarUrl ? (
              <Image
                src={m.avatarUrl}
                alt=""
                width={28}
                height={28}
                unoptimized={!m.avatarUrl.includes("avatars.githubusercontent.com")}
                className="mt-0.5 shrink-0 border border-cyan-100/20 bg-cyan-950/40 transition group-hover/msg:border-cyan-400/40"
                style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}
              />
            ) : (
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border border-cyan-100/20 bg-cyan-950/40 font-mono text-xs text-cyan-100/60" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
                ?
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs font-semibold text-cyan-100/90 transition group-hover/msg:text-cyan-300">
                  {m.githubLogin || "匿名"}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-50/40">
                  {relativeTime(m.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-cyan-50/70">
                {truncate(cleanMessage(m.message), 80)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
                width={28}
                height={28}
                sizes="28px"
                loading="lazy"
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
                {truncate(cleanMessage(m.message), 60)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
