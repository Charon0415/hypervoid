"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SiteSettings } from "@/components/SiteSettings";
import { MobileNav } from "@/components/MobileNav";
import { NavGroups } from "@/components/NavGroups";
import { HypervoidWordmark } from "@/components/HypervoidWordmark";
import { NotificationBell } from "@/components/NotificationBell";
import { useT } from "@/components/LocaleProvider";

export function SiteHeader() {
  const t = useT();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 font-bold tracking-tight"
        >
          <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center text-primary transition-transform group-hover:rotate-12">
            <svg
              viewBox="0 0 64 64"
              className="h-7 w-7"
              role="img"
              aria-label="Hypervoid"
            >
              <defs>
                <radialGradient id="hv-core" cx="0.4" cy="0.35" r="0.8">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="currentColor" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
                </radialGradient>
              </defs>
              <rect width="64" height="64" rx="14" fill="#0b0f1a" />
              <ellipse
                cx="32"
                cy="32"
                rx="24"
                ry="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.92"
              />
              <ellipse
                cx="32"
                cy="32"
                rx="24"
                ry="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.4"
                transform="rotate(72 32 32)"
              />
              <circle cx="32" cy="32" r="4.5" fill="url(#hv-core)" />
            </svg>
          </span>
          <span className="hidden text-foreground sm:inline">
            <HypervoidWordmark className="h-6 w-auto" />
          </span>
        </Link>

        <div className="mx-auto">
          <NavGroups />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Link
            href="/search"
            aria-label={t.common.search}
            title={`${t.common.search} (${isMac ? "⌘" : "Ctrl"}+K)`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-2.5 text-muted backdrop-blur-sm transition hover:border-primary hover:bg-card hover:text-primary"
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
            <kbd className="hidden font-mono text-[10px] tracking-wider opacity-70 md:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </Link>
          <div className="flex items-center gap-1.5 md:gap-2">
            <LocaleSwitch />
            <SiteSettings />
            <NotificationBell />
          </div>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
