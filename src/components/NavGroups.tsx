"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import { siteConfig } from "@/lib/site-config";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
};
type NavGroup = { key: string; label: string; items: NavItem[] };
type DirectLink = { href: string; label: string };

const CLOSE_DELAY = 160;

export function NavGroups() {
  const t = useT();
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const directLinks: DirectLink[] = [
    { href: "/posts", label: t.nav.posts },
    { href: "/archive", label: t.nav.archive },
  ];

  const SOCIAL_ICON: Record<string, string> = {
    github: "🐙",
    bilibili: "📺",
    gitee: "🍒",
    codeberg: "🦫",
    steam: "🎯",
    douyin: "🎵",
  };

  const groups: NavGroup[] = [
    {
      key: "create",
      label: t.nav.groupCreate,
      items: [
        { href: "/projects", label: t.nav.projects, icon: "📦" },
        { href: "/skills", label: t.nav.skills, icon: "🎯" },
        { href: "/timeline", label: t.nav.timeline, icon: "🕒" },
      ],
    },
    {
      key: "life",
      label: t.nav.groupLife,
      items: [
        { href: "/anime", label: t.nav.anime, icon: "🎬" },
        { href: "/movies", label: t.nav.movies, icon: "🎞️" },
        { href: "/books", label: t.nav.books, icon: "📚" },
        { href: "/games", label: t.nav.games, icon: "🎮" },
        { href: "/music", label: t.nav.music, icon: "🎵" },
        { href: "/albums", label: t.nav.albums, icon: "🖼️" },
        { href: "/diary", label: t.nav.diary, icon: "📔" },
      ],
    },
    {
      key: "interact",
      label: t.nav.groupInteract,
      items: [
        { href: "/guestbook", label: t.nav.guestbook, icon: "💬" },
        { href: "/friends", label: t.nav.friends, icon: "🤝" },
        { href: "/about", label: t.nav.about, icon: "👤" },
      ],
    },
    {
      key: "featured",
      label: t.nav.groupFeatured,
      items: [
        { href: "/pinned", label: "置顶文章", icon: "📌" },
        { href: "/series", label: "系列", icon: "📚" },
        { href: "/tags", label: "标签", icon: "🏷️" },
        { href: "/resources", label: "资源库", icon: "🧰" },
        { href: "/graph", label: "知识图谱", icon: "🕸️" },
        { href: "/year-in-review", label: "年度回顾", icon: "✨" },
        { href: "/posts/random", label: "随机一篇", icon: "🎲" },
      ],
    },
    {
      key: "links",
      label: t.nav.groupLinks,
      items: siteConfig.socials.map((s) => ({
        href: s.url,
        label: s.name,
        icon: SOCIAL_ICON[s.icon] ?? "🔗",
        external: true,
      })),
    },
  ];

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openGroup = useCallback((key: string) => {
    clearCloseTimer();
    setOpenKey(key);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenKey(null), CLOSE_DELAY);
  }, [clearCloseTimer]);

  const closeNow = useCallback(() => {
    clearCloseTimer();
    setOpenKey(null);
  }, [clearCloseTimer]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeNow();
    }
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) closeNow();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [closeNow]);

  useEffect(() => {
    setOpenKey(null);
  }, [pathname]);

  function isHrefActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }
  function isGroupActive(g: NavGroup) {
    return g.items.some((it) => isHrefActive(it.href));
  }

  return (
    <div
      ref={containerRef}
      className="hidden md:flex md:items-center"
      onMouseLeave={scheduleClose}
    >
      <div className="flex flex-nowrap items-center gap-0.5 overflow-visible rounded-full border border-border/70 bg-card/70 p-1 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-md">
        {directLinks.map((link) => {
          const active = isHrefActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={closeNow}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium tracking-tight transition ${
                active
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <span
          aria-hidden
          className="mx-1 h-4 w-px shrink-0 bg-border"
        />

        {groups.map((g) => {
          const isOpen = openKey === g.key;
          const isActive = isGroupActive(g);
          return (
            <div
              key={g.key}
              className="relative shrink-0"
              onMouseEnter={() => openGroup(g.key)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => (isOpen ? closeNow() : openGroup(g.key))}
                onFocus={() => openGroup(g.key)}
                className={`relative inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium tracking-tight transition ${
                  isOpen || isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {g.label}
                <svg
                  aria-hidden
                  className={`h-3 w-3 transition ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen ? (
                <div
                  role="menu"
                  className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
                >
                  <div className="w-max min-w-[14rem] rounded-2xl border border-border bg-card p-1.5 shadow-xl ring-1 ring-black/5">
                    {g.items.map((item) => {
                      const itemActive = !item.external && isHrefActive(item.href);
                      const className = `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        itemActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-background hover:text-foreground"
                      }`;
                      if (item.external) {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            role="menuitem"
                            onClick={closeNow}
                            className={className}
                          >
                            <span aria-hidden className="shrink-0 text-base leading-none">
                              {item.icon}
                            </span>
                            <span className="whitespace-nowrap">{item.label}</span>
                            <svg
                              aria-hidden
                              className="ml-auto h-3 w-3 shrink-0 opacity-60"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M7 17L17 7M17 7H8M17 7v9" />
                            </svg>
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          onClick={closeNow}
                          className={className}
                        >
                          <span aria-hidden className="shrink-0 text-base leading-none">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
