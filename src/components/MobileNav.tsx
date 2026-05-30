"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { SocialIcon } from "@/components/SocialIcon";
import { useT } from "@/components/LocaleProvider";
import { siteConfig } from "@/lib/site-config";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const t = useT();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open || !popoverRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        popoverRef.current,
        { autoAlpha: 0, y: -10, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power3.out" },
      );
      gsap.fromTo(
        linkRefs.current.filter(Boolean),
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.24, stagger: 0.025, ease: "power3.out" },
      );
    }, popoverRef);

    return () => ctx.revert();
  }, [open]);

  function setLinkRef(index: number) {
    return (node: HTMLAnchorElement | null) => {
      linkRefs.current[index] = node;
    };
  }

  const items = [
    { href: "/", label: t.nav.home },
    { href: "/posts", label: t.nav.posts },
    { href: "/anime", label: t.nav.anime },
    { href: "/movies", label: t.nav.movies },
    { href: "/books", label: t.nav.books },
    { href: "/games", label: t.nav.games },
    { href: "/music", label: t.nav.music },
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
        onClick={() => setOpen((value) => !value)}
        aria-label="打开菜单"
        aria-expanded={open}
        aria-controls="mobile-pill-nav"
        className={`hv-mobile-pill-button xl:hidden ${open ? "is-open" : ""}`}
      >
        <span className="hv-mobile-pill-line" />
        <span className="hv-mobile-pill-line" />
        <span className="hv-mobile-pill-line" />
      </button>

      {open ? (
        <div
          className="fixed inset-x-3 top-[4.85rem] z-50 xl:hidden"
          aria-modal="true"
          role="dialog"
          id="mobile-pill-nav"
        >
          <div
            className="fixed inset-0 -z-10 bg-black/46 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            ref={popoverRef}
            className="hv-mobile-pill-popover"
          >
            <div className="flex items-center justify-between border-b border-cyan-100/14 px-4 py-3">
              <span className="font-mono text-[11px] uppercase text-cyan-50/62">Hypervoid Nav</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
                className="grid h-9 w-9 place-items-center rounded-full border border-cyan-100/18 bg-cyan-50/8 text-cyan-50/72 transition hover:border-cyan-100/45 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <nav className="px-3 py-3">
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={setLinkRef(index)}
                    className={`hv-mobile-pill-link ${
                      pathname === item.href
                        ? "border-cyan-100/28 bg-cyan-50/12 font-medium text-cyan-100"
                        : "border-transparent text-cyan-50/72 hover:border-cyan-100/18 hover:bg-cyan-50/8 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-cyan-100/15 pt-3">
                <p className="px-3 pb-1.5 font-mono text-[10px] uppercase text-cyan-50/45">
                  {t.nav.groupLinks}
                </p>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {siteConfig.socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={s.name}
                      aria-label={s.name}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100/18 bg-white/[0.045] text-cyan-50/62 transition hover:border-cyan-100/45 hover:bg-cyan-50/10 hover:text-cyan-100"
                    >
                      <SocialIcon name={s.icon} className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
