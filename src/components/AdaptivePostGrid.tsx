"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders a responsive 2-col grid of post cards. If the last row would
 * visually collide with the element immediately after the grid's section
 * (the subscribe area), that row is hidden automatically.
 *
 * Children must be a flat array where every 2 items form one visual row
 * on sm+ screens.
 */
export function AdaptivePostGrid({ children }: { children: ReactNode[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(children.length);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const GAP = 16; // gap-4 = 1rem = 16px
    const MARGIN = 24; // safety margin above subscribe area

    function recalc() {
      if (!section || !grid) return;

      // The subscribe section is the next sibling
      const subscribeEl = section.nextElementSibling as HTMLElement | null;
      if (!subscribeEl) {
        setVisibleCount(children.length);
        return;
      }

      const subscribeTop = subscribeEl.getBoundingClientRect().top;
      const cards = grid.children;
      if (cards.length === 0) return;

      // Determine column count from actual layout
      const firstRect = cards[0].getBoundingClientRect();
      const secondRect = cards.length > 1 ? cards[1].getBoundingClientRect() : null;
      const cols = secondRect && Math.abs(secondRect.top - firstRect.top) < 5 ? 2 : 1;

      let newCount = children.length;

      // Walk rows from the bottom, hide the row if it overlaps
      for (let i = children.length - 1; i >= 0; i -= cols) {
        const el = cards[i] as HTMLElement | undefined;
        if (!el) continue;
        const rowBottom = el.getBoundingClientRect().bottom + GAP;
        if (rowBottom > subscribeTop - MARGIN) {
          newCount = i; // hide this entire row
        } else {
          break;
        }
      }

      // Only shrink, never grow (avoid flicker during scroll)
      setVisibleCount((prev) => Math.min(prev, newCount));
    }

    // Initial calc after paint
    const raf = requestAnimationFrame(() => {
      recalc();
      // Recalc once more after images may have loaded
      setTimeout(recalc, 500);
    });

    // Recalc on resize
    const ro = new ResizeObserver(() => recalc());
    ro.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [children.length]);

  const visible = children.slice(0, visibleCount);

  if (visible.length === 0) return null;

  return (
    <section ref={sectionRef}>
      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2">
        {visible}
      </div>
    </section>
  );
}
