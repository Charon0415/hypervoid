"use client";

import { useEffect } from "react";
import { markRead } from "@/lib/use-read-posts";

export function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => markRead(slug), 6000);
    return () => window.clearTimeout(t);
  }, [slug]);
  return null;
}
