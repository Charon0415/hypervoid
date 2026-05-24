import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览所有文章",
};

export default async function TagsIndex() {
  const tags = await getAllTags();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">所有标签</h1>
        <span className="text-sm text-muted">共 {tags.length} 个</span>
      </header>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group inline-flex items-baseline gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary transition hover:border-primary/50 hover:bg-primary/15"
            >
              <span>#{tag}</span>
              <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有标签。
        </p>
      )}
    </div>
  );
}
