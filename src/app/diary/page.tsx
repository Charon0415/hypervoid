import type { Metadata } from "next";
import { PlaceholderBanner } from "@/components/PlaceholderBanner";

export const metadata: Metadata = { title: "日记" };

export default function DiaryPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">日记</h1>
        <p className="mt-2 text-muted">短小、随性、不打算长期保存的碎片。</p>
      </header>
      <article className="rounded-xl border border-border bg-card p-6">
        <time className="text-xs uppercase tracking-wider text-muted">
          2026-05-23
        </time>
        <p className="mt-2">
          搭好了博客的骨架，开始写第一篇 Hello World。后面慢慢长大。
        </p>
      </article>
      <PlaceholderBanner hint="编辑 src/app/diary/page.tsx 或直接替换占位日记内容。" />
    </div>
  );
}
