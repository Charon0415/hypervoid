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
      className="hv-site-header sticky top-0 z-40 w-full border-b border-cyan-100/12 bg-slate-950/82 text-white shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[88rem] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-h-11 shrink-0 items-center gap-2 font-bold tracking-tight sm:gap-2.5">
          <Link
            href="/sign-in"
            aria-label="登录 Hypervoid"
            title="登录"
            className="group inline-flex h-10 w-10 items-center justify-center text-cyan-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70"
          >
            <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center transition-transform group-hover:rotate-12">
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
          </Link>
          <Link
            href="/"
            className="hidden min-h-10 items-center text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70 sm:inline-flex"
            aria-label="返回 Hypervoid 主页"
          >
            <HypervoidWordmark className="h-6 w-auto" />
          </Link>
        </div>

        <div className="mx-auto min-w-0">
          <NavGroups />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">
          <Link
            href="/search"
            aria-label={t.common.search}
            title={`${t.common.search} (${isMac ? "⌘" : "Ctrl"}+K)`}
            className="hv-action inline-flex h-10 w-10 items-center justify-center gap-1.5 px-0 text-cyan-50/70 sm:w-auto sm:px-3"
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
            <kbd className="hidden font-mono text-[10px] opacity-70 md:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </Link>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
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
