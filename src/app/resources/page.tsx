import type { Metadata } from "next";
import { groupByCategory, listResources } from "@/db/resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "资源库",
  description: "收藏的链接、软件、工具。",
};

export default async function ResourcesPage() {
  const items = await listResources();
  const grouped = groupByCategory(items);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">资源库</h1>
        <p className="mt-2 text-sm text-muted">
          一些好用的链接、软件、工具 · 共 {items.length} 条
        </p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          还没有资源 — 站长在<code>/admin/resources</code> 添加后会出现在这里。
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {[...grouped.entries()].map(([category, list]) => (
            <section key={category}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span>{category}</span>
                <span className="text-xs text-muted">{list.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm"
                  >
                    <span className="text-xl leading-none">
                      {r.icon || "🔗"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold transition group-hover:text-primary">
                        {r.title}
                      </p>
                      {r.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {r.description}
                        </p>
                      ) : null}
                      <p className="mt-1.5 truncate text-[10px] font-mono text-muted opacity-70">
                        {hostnameOf(r.url)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function hostnameOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}
