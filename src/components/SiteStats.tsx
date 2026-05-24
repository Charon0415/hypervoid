import { getSiteStats } from "@/lib/stats";

export async function SiteStats() {
  const stats = await getSiteStats();

  const items = [
    { label: "篇文章", value: stats.posts },
    { label: "次阅读", value: stats.views },
    { label: "次点赞", value: stats.likes },
    { label: "天运行", value: stats.daysOnline },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="font-mono text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {item.value.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
