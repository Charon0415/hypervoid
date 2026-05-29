"use client";

import { useEffect, useState } from "react";
import type { TOCItem } from "@/lib/toc";

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const minDepth = Math.min(...items.map((i) => i.depth));

  return (
    <nav aria-label="目录" className="text-sm">
      <p className="hv-kicker mb-3">Navigation matrix</p>
      <ul className="flex flex-col gap-1 border-l border-cyan-100/15">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const indent = (item.depth - minDepth) * 12;
          return (
            <li key={item.id}>
              <a
                href={"#" + item.id}
                style={{ paddingLeft: indent + 12 }}
                className={
                  "block border-l-2 py-1.5 pr-2 transition " +
                  (isActive
                    ? "-ml-px border-cyan-100 bg-cyan-100/10 font-medium text-cyan-50"
                    : "border-transparent text-cyan-50/55 hover:bg-white/[0.055] hover:text-cyan-50")
                }
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
