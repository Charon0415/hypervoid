"use client";

import { Check } from "lucide-react";
import { useReadPosts } from "@/lib/use-read-posts";

export function ReadBadge({ slug }: { slug: string }) {
  const read = useReadPosts();
  if (!read.has(slug)) return null;
  return (
    <span
      className="hv-chip shrink-0 gap-1 text-[10px]"
      title="你读过这篇"
    >
      <Check className="h-3 w-3" aria-hidden />
      已读
    </span>
  );
}
