import { SiteUptime } from "@/components/SiteUptime";
import { TechStackBadges } from "@/components/TechStackBadges";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-cyan-100/15 bg-black/30 text-cyan-50/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-sm sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100/10 pb-4">
          <div>
            <p className="hv-kicker">Hypervoid system footer</p>
            <p className="mt-1 text-xs text-cyan-50/48">
              © {year} Hypervoid · <span className="italic">One &amp; Only</span>
            </p>
          </div>
          <TechStackBadges />
        </div>
        <div className="flex flex-col items-start justify-between gap-3 font-mono text-[11px] uppercase sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-3">
            <span className="hv-chip">Signal online</span>
            <SiteUptime className="hidden text-cyan-50/55 sm:inline" />
          </p>
          <p className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/HyperCharon"
              target="_blank"
              rel="noreferrer noopener"
              className="transition hover:text-cyan-100"
            >
              GitHub
            </a>
            <a href="/rss.xml" className="transition hover:text-cyan-100">
              RSS
            </a>
            {siteConfig.donate.enabled ? (
              <a href="/donate" className="transition hover:text-cyan-100">
                Donate
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
