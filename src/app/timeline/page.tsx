import type { Metadata } from "next";
import { PlaceholderBanner } from "@/components/PlaceholderBanner";

export const metadata: Metadata = { title: "时间线" };

const EVENTS = [
  { date: "2026-05-23", title: "开始用 Next.js 重建博客 Hypervoid" },
  { date: "—", title: "更多事件，慢慢补充…" },
];

export default function TimelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">时间线</h1>
        <p className="mt-2 text-muted">个人重要节点与里程碑。</p>
      </header>
      <ol className="relative ml-3 space-y-6 border-l border-border pl-6">
        {EVENTS.map((event) => (
          <li key={event.date + event.title}>
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
            <time className="text-xs uppercase tracking-wider text-muted">
              {event.date}
            </time>
            <p className="mt-1 text-base">{event.title}</p>
          </li>
        ))}
      </ol>
      <PlaceholderBanner hint="编辑 src/app/timeline/page.tsx 添加你自己的里程碑。" />
    </div>
  );
}
