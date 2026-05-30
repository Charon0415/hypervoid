import Link from "next/link";
import { Tags } from "lucide-react";
import { getAllTags } from "@/lib/posts";

const MAX_TAGS = 14;

export async function TagCloud() {
  const tags = (await getAllTags()).slice(0, MAX_TAGS);
  if (!tags.length) return null;

  const counts = tags.map((t) => t.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-3">
      {/* Corner accent */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-accent/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-accent/50 to-transparent" />

      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center border border-accent/30 bg-card text-accent" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
          <Tags className="h-3.5 w-3.5" aria-hidden />
        </div>
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground/80">
          Tag_Cloud
        </h3>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1">
        {tags.map((t) => {
          const s = max === min ? 0.5 : (t.count - min) / (max - min);
          const fontSize = 0.66 + s * 0.24;
          const opacity = 0.56 + s * 0.38;
          return (
            <Link
              key={t.tag}
              href={"/tags/" + encodeURIComponent(t.tag)}
              title={t.tag + " · " + t.count + " 篇"}
              className="inline-flex items-baseline gap-1 border border-border bg-gradient-to-br from-card/30 to-transparent px-1.5 py-0.5 font-mono font-medium text-foreground transition hover:border-accent/40 hover:bg-card-hover hover:text-accent hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              style={{ fontSize: String(fontSize) + "rem", opacity, clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}
            >
              <span className="text-accent/70">#</span>
              {t.tag}
              <span className="text-[10px] text-muted-soft">{t.count}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
