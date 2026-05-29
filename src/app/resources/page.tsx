import type { Metadata } from "next";
import { ExternalLink, LibraryBig, Link2 } from "lucide-react";
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
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="hv-panel relative overflow-hidden p-5 text-center sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker justify-center">Resource vault / external tools</p>
        <h1 className="hv-title mt-2 flex items-center justify-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
          <LibraryBig className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
          资源库
        </h1>
        <p className="mt-4 text-sm text-cyan-50/62">
          一些好用的链接、软件、工具 / 共 {items.length} 条
        </p>
      </header>

      {items.length === 0 ? (
        <p className="hv-panel border-dashed p-12 text-center text-cyan-50/60">
          还没有资源 / 站长在 <code>/admin/resources</code> 添加后会出现在这里。
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {[...grouped.entries()].map(([category, list]) => (
            <section key={category}>
              <h2 className="hv-title mb-3 flex items-center gap-2 text-lg font-semibold tracking-normal">
                <span>{category}</span>
                <span className="hv-chip text-xs font-normal">{list.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hv-panel hv-panel-hover group flex items-start gap-3 p-4"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center border border-cyan-100/14 bg-cyan-50/[0.035] text-cyan-100/70">
                      <Link2 className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-cyan-50 transition group-hover:text-cyan-100">
                        {r.title}
                      </p>
                      {r.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-cyan-50/55">
                          {r.description}
                        </p>
                      ) : null}
                      <p className="mt-1.5 truncate font-mono text-[10px] uppercase text-cyan-50/42">
                        {hostnameOf(r.url)}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-cyan-100/42 transition group-hover:text-cyan-50" aria-hidden />
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
