"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeColorPicker } from "@/components/ThemeColorPicker";
import { MobileNav } from "@/components/MobileNav";
import { useT } from "@/components/LocaleProvider";

export function SiteHeader() {
  const t = useT();
  const navItems = [
    { href: "/posts", label: t.nav.posts },
    { href: "/anime", label: t.nav.anime },
    { href: "/projects", label: t.nav.projects },
    { href: "/skills", label: t.nav.skills },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/albums", label: t.nav.albums },
    { href: "/diary", label: t.nav.diary },
    { href: "/guestbook", label: t.nav.guestbook },
    { href: "/friends", label: t.nav.friends },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            H
          </span>
          <span className="hidden sm:inline">Hypervoid</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 overflow-x-auto text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2.5 py-1.5 text-muted transition hover:bg-card hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0 md:gap-2">
          <Link
            href="/search"
            aria-label={t.common.search}
            title={t.common.search}
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
          <div className="hidden sm:flex sm:items-center sm:gap-1.5 md:gap-2">
            <LocaleSwitch />
            <ThemeColorPicker />
          </div>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
