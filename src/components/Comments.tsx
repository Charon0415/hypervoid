"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CommentsImpl = dynamic(
  () => import("./CommentsImpl").then((m) => m.CommentsImpl),
  { ssr: false },
);

/**
 * Defers the Giscus iframe until the comments section is scrolled near.
 * Cuts ~80KB off the post-page initial JS bundle since giscus + its iframe
 * runtime only mount once the visitor actually wants to read comments.
 */
export function Comments() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load || !ref.current) return;
    const el = ref.current;
    if (!("IntersectionObserver" in window)) {
      setLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLoad(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref}>
      {load ? (
        <CommentsImpl />
      ) : (
        <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-xs text-muted">
          滚动到这里时加载评论…
        </div>
      )}
    </div>
  );
}
