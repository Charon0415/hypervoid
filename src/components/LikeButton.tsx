"use client";

import { useEffect, useState, useTransition } from "react";
import { recordLike, unrecordLike } from "@/app/posts/[slug]/actions";
import { useT } from "@/components/LocaleProvider";

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
  const t = useT();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLiked(localStorage.getItem(STORAGE_PREFIX + slug) === "1");
  }, [slug]);

  const onToggle = () => {
    if (pending) return;
    startTransition(async () => {
      const action = liked ? unrecordLike : recordLike;
      const newCount = await action(slug);
      if (newCount !== null) {
        setCount(newCount);
        const newLiked = !liked;
        setLiked(newLiked);
        try {
          if (newLiked) {
            localStorage.setItem(STORAGE_PREFIX + slug, "1");
          } else {
            localStorage.removeItem(STORAGE_PREFIX + slug);
          }
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
      onClick={onToggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? t.post.unlike : t.post.like}
      title={liked ? t.post.unlike : t.post.like}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
        liked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-primary hover:text-primary"
      } disabled:opacity-60`}
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
