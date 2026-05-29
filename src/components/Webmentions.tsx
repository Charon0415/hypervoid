import Image from "next/image";
import { Link2 } from "lucide-react";
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
    <section className="mt-10">
      <h2 className="hv-title mb-4 flex items-center gap-2 text-sm font-semibold tracking-normal">
        <Link2 className="h-4 w-4 text-cyan-100/70" aria-hidden />
        来自外部站点的提及
        <span className="hv-chip text-xs font-normal">({items.length})</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((w) => (
          <li
            key={w.id}
            className="hv-panel flex gap-3 p-3"
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
                className="h-10 w-10 shrink-0 border border-cyan-100/18 object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-cyan-100/18 bg-cyan-50/[0.055] font-mono text-xs text-cyan-100">
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
                className="font-medium text-cyan-50 hover:text-cyan-100"
              >
                {w.authorName ?? hostnameOf(w.source)}
              </a>
              <p className="text-[10px] text-cyan-50/48">
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
                <p className="mt-1 line-clamp-3 text-sm text-cyan-50/70">
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
