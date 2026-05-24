"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SiteSettings } from "@/components/SiteSettings";
import { useT } from "@/components/LocaleProvider";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = [
    { href: "/", label: t.nav.home },
    { href: "/posts", label: t.nav.posts },
    { href: "/anime", label: t.nav.anime },
    { href: "/movies", label: t.nav.movies },
    { href: "/books", label: t.nav.books },
    { href: "/games", label: t.nav.games },
    { href: "/projects", label: t.nav.projects },
    { href: "/skills", label: t.nav.skills },
    { href: "/timeline", label: t.nav.timeline },
    { href: "/albums", label: t.nav.albums },
    { href: "/diary", label: t.nav.diary },
    { href: "/guestbook", label: t.nav.guestbook },
    { href: "/friends", label: t.nav.friends },
    { href: "/about", label: t.nav.about },
    { href: "/archive", label: "归档" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-primary hover:text-primary md:hidden"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-screen w-72 max-w-[85vw] overflow-y-auto bg-card text-foreground shadow-2xl ring-1 ring-border">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <span className="font-bold tracking-tight">Hypervoid</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
                className="rounded-md p-1.5 text-muted transition hover:bg-background hover:text-foreground"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <nav className="px-3 py-3">
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2.5 text-sm transition ${
                      pathname === item.href
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/85 hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div
              className="mx-3 mb-3 mt-2 flex items-center justify-end gap-2 border-t border-border pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <LocaleSwitch />
              <SiteSettings />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
