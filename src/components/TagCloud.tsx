import Link from "next/link";
import { Tags } from "lucide-react";
import { getAllTags } from "@/lib/posts";

const MAX_TAGS = 24;

export async function TagCloud() {
  const tags = (await getAllTags()).slice(0, MAX_TAGS);
  if (!tags.length) return null;

  const counts = tags.map((t) => t.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-5">
      {/* Corner accent */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center border border-cyan-400/30 bg-cyan-950/50 text-cyan-300" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
          <Tags className="h-3.5 w-3.5" aria-hidden />
        </div>
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100/80">
          Tag_Cloud
        </h3>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tags.map((t) => {
          const s = max === min ? 0.5 : (t.count - min) / (max - min);
          const fontSize = 0.72 + s * 0.36;
          const opacity = 0.56 + s * 0.38;
          return (
            <Link
              key={t.tag}
              href={"/tags/" + encodeURIComponent(t.tag)}
              title={t.tag + " · " + t.count + " 篇"}
              className="inline-flex items-baseline gap-1 border border-cyan-100/14 bg-gradient-to-br from-cyan-950/30 to-transparent px-2.5 py-1 font-mono font-medium text-cyan-100 transition hover:border-cyan-400/40 hover:bg-cyan-900/30 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(103,232,249,0.15)]"
              style={{ fontSize: String(fontSize) + "rem", opacity, clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}
            >
              <span className="text-cyan-400/70">#</span>
              {t.tag}
              <span className="text-[10px] text-cyan-50/45">{t.count}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
