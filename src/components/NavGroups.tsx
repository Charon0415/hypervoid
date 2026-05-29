"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, BookOpenText, Box, CalendarDays, Clapperboard, Code2, Gamepad2, GitBranch, GraduationCap, Handshake, ImageIcon, MessageSquareText, Music2, Network, Pin, Sparkles, Tags, UserRound, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import { siteConfig } from "@/lib/site-config";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
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

  const SOCIAL_ICON: Record<string, LucideIcon> = {
    github: GitBranch,
    bilibili: Clapperboard,
    gitee: Code2,
    codeberg: Code2,
    steam: Gamepad2,
    douyin: Music2,
  };

  const groups: NavGroup[] = [
    {
      key: "create",
      label: t.nav.groupCreate,
      items: [
        { href: "/projects", label: t.nav.projects, icon: Box },
        { href: "/skills", label: t.nav.skills, icon: GraduationCap },
        { href: "/timeline", label: t.nav.timeline, icon: CalendarDays },
      ],
    },
    {
      key: "life",
      label: t.nav.groupLife,
      items: [
        { href: "/anime", label: t.nav.anime, icon: Clapperboard },
        { href: "/movies", label: t.nav.movies, icon: Clapperboard },
        { href: "/books", label: t.nav.books, icon: BookOpenText },
        { href: "/games", label: t.nav.games, icon: Gamepad2 },
        { href: "/music", label: t.nav.music, icon: Music2 },
        { href: "/albums", label: t.nav.albums, icon: ImageIcon },
        { href: "/diary", label: t.nav.diary, icon: Archive },
      ],
    },
    {
      key: "interact",
      label: t.nav.groupInteract,
      items: [
        { href: "/guestbook", label: t.nav.guestbook, icon: MessageSquareText },
        { href: "/friends", label: t.nav.friends, icon: Handshake },
        { href: "/about", label: t.nav.about, icon: UserRound },
      ],
    },
    {
      key: "featured",
      label: t.nav.groupFeatured,
      items: [
        { href: "/pinned", label: "置顶文章", icon: Pin },
        { href: "/series", label: "系列", icon: BookOpenText },
        { href: "/tags", label: "标签", icon: Tags },
        { href: "/resources", label: "资源库", icon: Wrench },
        { href: "/graph", label: "知识图谱", icon: Network },
        { href: "/year-in-review", label: "年度回顾", icon: Sparkles },
        { href: "/posts/random", label: "随机一篇", icon: Sparkles },
      ],
    },
    {
      key: "links",
      label: t.nav.groupLinks,
      items: siteConfig.socials.map((s) => ({
        href: s.url,
        label: s.name,
        icon: SOCIAL_ICON[s.icon] ?? Network,
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
      <div className="flex flex-nowrap items-center gap-0.5 overflow-visible border border-cyan-100/15 bg-white/[0.055] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        {directLinks.map((link) => {
          const active = isHrefActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={closeNow}
              className={`shrink-0 px-3.5 py-1.5 text-sm font-medium tracking-tight transition ${
                active
                  ? "bg-cyan-100/15 text-cyan-100 shadow-sm"
                  : "text-cyan-50/62 hover:bg-white/[0.055] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <span
          aria-hidden
          className="mx-1 h-4 w-px shrink-0 bg-cyan-100/15"
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
                className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium tracking-tight transition ${
                  isOpen || isActive
                    ? "bg-cyan-100/15 text-cyan-100 shadow-sm"
                    : "text-cyan-50/62 hover:bg-white/[0.055] hover:text-white"
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
                  <div className="hv-panel w-max min-w-[14rem] p-1.5 shadow-2xl">
                    {g.items.map((item) => {
                      const itemActive = !item.external && isHrefActive(item.href);
                      const ItemIcon = item.icon;
                      const className = `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        itemActive
                          ? "bg-cyan-100/12 text-cyan-100"
                          : "text-cyan-50/72 hover:bg-white/[0.065] hover:text-white"
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
                            <ItemIcon aria-hidden className="h-4 w-4 shrink-0 text-cyan-100/75" />
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
                          <ItemIcon aria-hidden className="h-4 w-4 shrink-0 text-cyan-100/75" />
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
