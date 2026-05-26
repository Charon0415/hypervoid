"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/components/SettingsProvider";

export function CursorEffect() {
  const { cursorEffect } = useSettings();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const visible = useRef(false);
  const hovering = useRef(false);

  useEffect(() => {
    if (!cursorEffect) return;
    // Only on desktop with fine pointer
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // Hide default cursor
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        dot.style.opacity = "1";
        ringEl.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible.current = false;
      dot.style.opacity = "0";
      ringEl.style.opacity = "0";
    };

    // Track interactive elements for hover state
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest("a, button, [role='button'], input, textarea, select, label[for], [tabindex]")
      ) {
        hovering.current = true;
      }
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest("a, button, [role='button'], input, textarea, select, label[for], [tabindex]")
      ) {
        hovering.current = false;
      }
    };

    ring.current.x = mouse.current.x;
    ring.current.y = mouse.current.y;

    let raf = 0;
    const loop = () => {
      // Dot follows instantly
      dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;

      // Ring follows with lerp delay
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      const scale = hovering.current ? 1.6 : 1;
      ringEl.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) scale(${scale})`;
      ringEl.style.borderColor = hovering.current
        ? "var(--primary)"
        : "var(--foreground)";

      raf = requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
    };
  }, [cursorEffect]);

  if (!cursorEffect) return null;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: "50%",
          backgroundColor: "var(--primary)",
          opacity: 0,
          willChange: "transform",
          transition: "opacity 200ms, background-color 200ms",
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          borderRadius: "50%",
          border: "1.5px solid var(--foreground)",
          opacity: 0,
          willChange: "transform",
          transition: "opacity 200ms, border-color 250ms, transform 120ms ease-out",
        }}
      />
    </>
  );
}
