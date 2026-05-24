"use client";

import { useReadPosts } from "@/lib/use-read-posts";

export function ReadBadge({ slug }: { slug: string }) {
  const read = useReadPosts();
  if (!read.has(slug)) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary"
      title="你读过这篇"
    >
      ✓ 已读
    </span>
  );
}
