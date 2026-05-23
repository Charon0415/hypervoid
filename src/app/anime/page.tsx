import type { Metadata } from "next";

export const metadata: Metadata = { title: "番剧追番" };

const SAMPLE = [
  { title: "示例番剧 1", status: "在看", rating: "⭐⭐⭐⭐⭐" },
  { title: "示例番剧 2", status: "已看完", rating: "⭐⭐⭐⭐" },
  { title: "示例番剧 3", status: "想看", rating: "—" },
];

export default function AnimePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">番剧追番</h1>
        <p className="mt-2 text-muted">
          记录正在看、已看完、想看的动画作品。
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs uppercase tracking-wider text-muted">
              {item.status}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm">{item.rating}</p>
          </div>
        ))}
      </div>
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
        ⏳ 这是占位数据。后续会接入 Bangumi API 或本地数据文件，自动更新。
      </p>
    </div>
  );
}
