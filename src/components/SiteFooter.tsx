import { SiteUptime } from "@/components/SiteUptime";
import { TechStackBadges } from "@/components/TechStackBadges";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-cyan-100/15 bg-gradient-to-b from-slate-950/80 to-black/95 text-cyan-50/60 backdrop-blur-xl">
      {/* Top accent line */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-sm sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">
                Hypervoid_System_Footer
              </p>
            </div>
            <p className="mt-2 font-mono text-xs text-cyan-50/48">
              © {year} Hypervoid · <span className="italic">One &amp; Only</span>
            </p>
          </div>
          <TechStackBadges />
        </div>
        <div className="flex flex-col items-start justify-between gap-3 font-mono text-[11px] uppercase sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 border border-cyan-400/30 bg-cyan-950/40 px-2 py-0.5 text-cyan-300" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Online
            </span>
            <SiteUptime className="hidden text-cyan-50/55 sm:inline" />
          </p>
          <p className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/HyperCharon"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 border-b border-transparent transition hover:border-cyan-400/50 hover:text-cyan-300"
            >
              GitHub
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
            <a href="/rss.xml" className="border-b border-transparent transition hover:border-cyan-400/50 hover:text-cyan-300">
              RSS
            </a>
            {siteConfig.donate.enabled ? (
              <a href="/donate" className="border-b border-transparent transition hover:border-cyan-400/50 hover:text-cyan-300">
                Donate
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
