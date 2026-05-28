import Link from "next/link";
import { getAllTags } from "@/lib/posts";

const MAX_TAGS = 24;

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h % 360);
}

function hashRotate(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h * 31) + str.charCodeAt(i) * 17) | 0;
  return (Math.abs(h % 13)) - 6; // -6 to +6 degrees
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
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((t) => {
          const s = max === min ? 0.5 : (t.count - min) / (max - min);
          const fontSize = 0.7 + s * 0.4;
          const hue = hashHue(t.tag);
          const rotate = hashRotate(t.tag);
          const opacity = 0.55 + s * 0.45;
          return (
            <Link
              key={t.tag}
              href={`/tags/${encodeURIComponent(t.tag)}`}
              title={`${t.tag} · ${t.count} 篇`}
              className="inline-block rounded-lg px-2.5 py-1 font-medium transition-all duration-200 hover:scale-110 hover:shadow-sm"
              style={{
                fontSize: `${fontSize}rem`,
                color: `hsl(${hue}, 70%, 45%)`,
                background: `hsl(${hue}, 80%, 95%)`,
                transform: `rotate(${rotate}deg)`,
                opacity,
              }}
            >
              {t.tag}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
