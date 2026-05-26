import { SiteUptime } from "@/components/SiteUptime";
import { TechStackBadges } from "@/components/TechStackBadges";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-sm text-muted sm:py-8">
        <TechStackBadges />
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between sm:w-full">
          <p>
            © {year} Hypervoid · <span className="italic">One &amp; Only</span>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-3">
            <SiteUptime className="hidden font-mono text-xs sm:inline" />
            <span aria-hidden className="hidden sm:inline">·</span>
            <a
              href="https://github.com/HyperCharon"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-primary"
            >
              GitHub
            </a>
            <a href="/rss.xml" className="hover:text-primary">
              RSS
            </a>
            {siteConfig.donate.enabled ? (
              <a href="/donate" className="hover:text-primary">
                ☕ 赞赏
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
