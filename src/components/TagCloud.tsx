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
    <aside className="hv-panel p-5">
      <h3 className="hv-title flex items-center gap-2 text-sm font-semibold tracking-normal">
        <Tags className="h-4 w-4 text-cyan-100/70" aria-hidden />
        标签云
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((t) => {
          const s = max === min ? 0.5 : (t.count - min) / (max - min);
          const fontSize = 0.72 + s * 0.36;
          const opacity = 0.56 + s * 0.38;
          return (
            <Link
              key={t.tag}
              href={"/tags/" + encodeURIComponent(t.tag)}
              title={t.tag + " · " + t.count + " 篇"}
              className="inline-flex items-baseline gap-1 border border-cyan-100/14 bg-white/[0.035] px-2.5 py-1 font-medium text-cyan-100 transition hover:border-cyan-100/40 hover:bg-cyan-100/12 hover:text-cyan-50"
              style={{ fontSize: String(fontSize) + "rem", opacity }}
            >
              <span>#</span>
              {t.tag}
              <span className="font-mono text-[10px] text-cyan-50/45">{t.count}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
