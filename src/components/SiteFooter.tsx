import { SiteUptime } from "@/components/SiteUptime";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>
          © {year} Hypervoid · <span className="italic">One &amp; Only</span>
        </p>
        <p className="flex flex-wrap items-center gap-3">
          <SiteUptime className="font-mono text-xs" />
          <span aria-hidden>·</span>
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
        </p>
      </div>
    </footer>
  );
}
