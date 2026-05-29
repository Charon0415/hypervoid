"use client";

import { Clock3 } from "lucide-react";
import { useReadLater } from "@/lib/use-read-later";

export function ReadLaterButton({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description?: string | null;
}) {
  const { isQueued, toggle, ready } = useReadLater();
  const active = ready && isQueued(slug);

  return (
    <button
      type="button"
      onClick={() => toggle({ slug, title, description })}
      aria-label={active ? "从稍后读移除" : "稍后读"}
      title={active ? "已在稍后读 / 点击移除" : "稍后读 → /reading-list"}
      className={"hv-action h-9 w-9 p-0 " + (
        active ? "border-cyan-100/50 bg-cyan-100/14 text-cyan-50" : ""
      )}
    >
      <Clock3 aria-hidden className="h-4 w-4" />
    </button>
  );
}
