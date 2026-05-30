import { getSiteStats } from "@/lib/stats";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export async function SiteStats() {
  const stats = await getSiteStats();

  const items = [
    {
      label: "文章",
      value: stats.posts.toLocaleString(),
      icon: (
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      ),
    },
    {
      label: "阅读",
      value: formatNumber(stats.views),
      icon: (
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "点赞",
      value: formatNumber(stats.likes),
      icon: (
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      label: "运行",
      value: `${stats.daysOnline.toLocaleString()} 天`,
      icon: (
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-5">
      {/* Corner accents */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-cyan-400/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />

      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100/80">
          Site_Stats
        </h3>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400/70">Live</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="group/stat relative overflow-hidden border border-cyan-100/10 bg-gradient-to-br from-cyan-950/30 to-transparent px-3 py-2.5 transition hover:border-cyan-400/30 hover:bg-cyan-950/40"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          >
            {/* Scan line on hover */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity group-hover/stat:opacity-100" />

            <span
              aria-hidden
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center border border-cyan-100/14 bg-cyan-950/60 text-cyan-100/70 transition group-hover/stat:border-cyan-400/40 group-hover/stat:text-cyan-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}
            >
              {item.icon}
            </span>
            <p
              className="whitespace-nowrap pr-6 font-mono text-base font-bold leading-tight text-cyan-100 transition group-hover/stat:text-cyan-300"
              title={item.value}
            >
              {item.value}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase leading-tight tracking-wider text-cyan-50/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
