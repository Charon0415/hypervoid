import Link from "next/link";
import { getAllSeries } from "@/lib/posts";

export async function TopicCollections() {
  const series = await getAllSeries();
  if (!series.length) return null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
        专题合集
      </h3>
      <ul className="mt-3 space-y-1.5">
        {series.map((s) => (
          <li key={s.name}>
            <Link
              href={`/series/${encodeURIComponent(s.name)}`}
              className="group flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition hover:bg-primary/5"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </span>
              <span className="line-clamp-1 flex-1 text-sm text-foreground transition group-hover:text-primary">
                {s.name}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {s.count} 篇
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/series"
        className="mt-3 block text-center text-xs text-muted transition hover:text-primary"
      >
        查看全部 →
      </Link>
    </aside>
  );
}
