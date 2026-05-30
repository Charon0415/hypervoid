import Link from "next/link";
import { FileCode2, Rss } from "lucide-react";

export function RssSubscribeCard() {
  return (
    <div className="hv-panel-sci group relative overflow-hidden p-3 sm:p-3.5">
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,0.85fr)_auto] md:items-end">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-semibold uppercase tracking-widest text-cyan-100/80">Subscribe_Updates</h3>
          <p className="mt-1.5 text-sm leading-snug text-cyan-50/70">
            邮件订阅暂未开放，可以通过 RSS 阅读器获取新文章。
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 md:justify-end">
          <Link
            href="/rss.xml"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.12)] transition hover:border-cyan-400/60 hover:bg-cyan-400/20 hover:text-cyan-100"
          >
            <Rss className="h-3.5 w-3.5" aria-hidden />
            RSS 订阅
          </Link>
          <Link
            href="/rss.xml"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-100/18 bg-cyan-950/30 px-3 py-1.5 font-mono text-xs text-cyan-100/70 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300"
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden />
            RSS XML
          </Link>
        </div>
      </div>
    </div>
  );
}
