"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="text-5xl" aria-hidden>
        📄
      </p>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          文章加载失败
        </h2>
        <p className="mt-1 text-sm text-muted">
          可能是网络波动或这篇文章暂时不可用。
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5"
        >
          重试
        </button>
        <Link
          href="/posts"
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-background"
        >
          返回文章列表
        </Link>
        <Link
          href="/posts/random"
          prefetch={false}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted transition hover:bg-background"
        >
          随机一篇
        </Link>
      </div>
    </div>
  );
}
