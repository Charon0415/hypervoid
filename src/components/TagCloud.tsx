import Link from "next/link";
import { getAllTags } from "@/lib/posts";

const MAX_TAGS = 24;

function scale(count: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (count - min) / (max - min);
}

export async function TagCloud() {
  const tags = (await getAllTags()).slice(0, MAX_TAGS);
  if (!tags.length) return null;

  const counts = tags.map((t) => t.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return (
    <aside className="rounded-3xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
        标签云
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => {
          const s = scale(t.count, min, max);
          const fontSize = 0.72 + s * 0.35;
          return (
            <Link
              key={t.tag}
              href={`/tags/${encodeURIComponent(t.tag)}`}
              title={`${t.tag} · ${t.count} 篇`}
              className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 font-medium text-primary/80 transition hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
              style={{ fontSize: `${fontSize}rem` }}
            >
              #{t.tag}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
