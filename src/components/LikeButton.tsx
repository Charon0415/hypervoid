"use client";

import { useEffect, useState, useTransition } from "react";
import { recordLike } from "@/app/posts/[slug]/actions";

const STORAGE_PREFIX = "hypervoid:liked:";

export function LikeButton({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number | null;
}) {
  const [count, setCount] = useState<number | null>(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLiked(localStorage.getItem(STORAGE_PREFIX + slug) === "1");
  }, [slug]);

  const onLike = () => {
    if (liked || pending) return;
    startTransition(async () => {
      const newCount = await recordLike(slug);
      if (newCount !== null) {
        setCount(newCount);
        setLiked(true);
        try {
          localStorage.setItem(STORAGE_PREFIX + slug, "1");
        } catch {
          // localStorage may be unavailable (Safari private mode etc.)
        }
      }
    });
  };

  if (count === null) return null;

  return (
    <button
      type="button"
      onClick={onLike}
      disabled={liked || pending}
      aria-pressed={liked}
      aria-label={liked ? "已点赞" : "点赞"}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
        liked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-primary hover:text-primary"
      } disabled:cursor-default`}
    >
      <svg
        aria-hidden="true"
        className={`h-4 w-4 transition-transform ${
          pending ? "scale-125" : "group-hover:scale-110"
        }`}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
