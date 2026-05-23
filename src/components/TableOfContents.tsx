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
      <p className="mb-3 text-xs uppercase tracking-wider text-muted">
        目录
      </p>
      <ul className="flex flex-col gap-1.5 border-l border-border">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const indent = (item.depth - minDepth) * 12;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                style={{ paddingLeft: indent + 12 }}
                className={`block border-l-2 py-1 pr-2 transition ${
                  isActive
                    ? "-ml-px border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
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
