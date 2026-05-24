"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SiteSettings } from "@/components/SiteSettings";
import { MobileNav } from "@/components/MobileNav";
import { NavGroups } from "@/components/NavGroups";
import { useT } from "@/components/LocaleProvider";

export function SiteHeader() {
  const t = useT();
  const router = useRouter();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));

    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight"
        >
          <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center text-primary">
            <svg
              viewBox="0 0 64 64"
              className="h-7 w-7"
              role="img"
              aria-label="Hypervoid"
            >
              <rect width="64" height="64" rx="14" fill="#0b0f1a" />
              <ellipse
                cx="32"
                cy="32"
                rx="22"
                ry="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                opacity="0.95"
              />
              <ellipse
                cx="32"
                cy="32"
                rx="22"
                ry="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                opacity="0.55"
                transform="rotate(60 32 32)"
              />
              <ellipse
                cx="32"
                cy="32"
                rx="22"
                ry="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                opacity="0.35"
                transform="rotate(-60 32 32)"
              />
              <circle cx="32" cy="32" r="5" fill="#ffffff" />
            </svg>
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
            title={`${t.common.search} (${isMac ? "⌘" : "Ctrl"}+K)`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-muted transition hover:border-primary hover:text-primary"
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
          <div className="hidden items-center gap-1.5 md:flex md:gap-2">
            <LocaleSwitch />
            <SiteSettings />
          </div>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
