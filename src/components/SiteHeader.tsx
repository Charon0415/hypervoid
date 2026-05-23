import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/anime", label: "番剧" },
  { href: "/projects", label: "项目" },
  { href: "/skills", label: "技能" },
  { href: "/timeline", label: "时间线" },
  { href: "/albums", label: "相册" },
  { href: "/diary", label: "日记" },
  { href: "/friends", label: "友链" },
  { href: "/about", label: "关于" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            H
          </span>
          <span className="hidden sm:inline">Hypervoid</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto text-sm">
          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2.5 py-1.5 text-muted transition hover:bg-card hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/search"
          aria-label="搜索"
          title="搜索文章"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted transition hover:border-primary hover:text-primary"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
