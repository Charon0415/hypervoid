import Image from "next/image";
import type { Webmention } from "@/lib/webmentions";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function Webmentions({ items }: { items: Webmention[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span aria-hidden>🔗</span>
        来自外部站点的提及
        <span className="text-xs font-normal text-muted">({items.length})</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((w) => (
          <li
            key={w.id}
            className="flex gap-3 rounded-xl border border-border bg-card p-3"
          >
            {w.authorPhoto ? (
              <Image
                src={w.authorPhoto}
                alt=""
                width={40}
                height={40}
                sizes="40px"
                loading="lazy"
                unoptimized
                className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
                {(w.authorName ?? hostnameOf(w.source))
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <a
                href={w.source}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="font-medium hover:text-primary"
              >
                {w.authorName ?? hostnameOf(w.source)}
              </a>
              <p className="text-[10px] text-muted">
                {hostnameOf(w.source)}
                {w.verifiedAt ? (
                  <>
                    {" · "}
                    <time>
                      {new Date(w.verifiedAt).toLocaleDateString("zh-CN")}
                    </time>
                  </>
                ) : null}
              </p>
              {w.content ? (
                <p className="mt-1 line-clamp-3 text-sm text-foreground/80">
                  {w.content}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
