"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeColorPicker } from "@/components/ThemeColorPicker";
import { MobileNav } from "@/components/MobileNav";
import { NavGroups } from "@/components/NavGroups";
import { useT } from "@/components/LocaleProvider";

export function SiteHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            H
          </span>
          <span className="hidden sm:inline">Hypervoid</span>
        </Link>

        <div className="mx-auto">
          <NavGroups />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
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
