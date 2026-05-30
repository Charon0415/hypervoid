import { getSiteStats } from "@/lib/stats";
import { StatsCarousel, type StatsCarouselItem } from "@/components/StatsCarousel";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export async function SiteStats() {
  const stats = await getSiteStats();

  const items: StatsCarouselItem[] = [
    {
      id: "posts",
      title: "Articles",
      value: stats.posts.toLocaleString(),
      description: "已发布的公开文章",
      tone: "cyan",
    },
    {
      id: "views",
      title: "Page Views",
      value: formatNumber(stats.views),
      description: "累计阅读和访问信号",
      tone: "cyan",
    },
    {
      id: "likes",
      title: "Reactions",
      value: formatNumber(stats.likes),
      description: "读者留下的互动反馈",
      tone: "cyan",
    },
    {
      id: "uptime",
      title: "Uptime",
      value: `${stats.daysOnline.toLocaleString()} 天`,
      description: "Hypervoid 已在线运行",
      tone: "cyan",
    },
  ];

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-3">
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-accent/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-accent/60 to-transparent" />

      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground/80">
          Site_Stats
        </h3>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-accent/70">Live</span>
        </div>
      </div>

      <div className="mt-2.5">
        <StatsCarousel
          items={items}
          baseWidth={330}
          autoplay
          autoplayDelay={3000}
          pauseOnHover={false}
          loop={false}
        />
      </div>
    </aside>
  );
}
