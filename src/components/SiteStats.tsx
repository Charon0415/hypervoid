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
      value: `${stats.daysOnline.toLocaleString()} 天`,
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
    <aside className="hv-panel p-5">
      <h3 className="hv-title text-sm font-semibold tracking-normal">
        站点统计
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden border border-cyan-100/12 bg-white/[0.035] px-3 py-2.5"
          >
            <span
              aria-hidden
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center border border-cyan-100/14 bg-cyan-50/[0.055] text-cyan-100/70"
            >
              {item.icon}
            </span>
            <p
              className="whitespace-nowrap pr-6 font-mono text-base font-semibold leading-tight text-cyan-50"
              title={item.value}
            >
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-cyan-50/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
