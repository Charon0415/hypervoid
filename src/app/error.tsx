"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
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
      <p className="text-6xl" aria-hidden>
        ⚡
      </p>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          出了点问题
        </h2>
        <p className="mt-1 text-sm text-muted">
          页面加载时遇到了意外错误，请重试。
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
          href="/"
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-background"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
