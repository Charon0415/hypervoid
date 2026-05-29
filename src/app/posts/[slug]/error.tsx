"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Dices, FileWarning, RotateCcw } from "lucide-react";

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
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="hv-panel p-8">
        <FileWarning className="mx-auto h-10 w-10 text-cyan-100/65" aria-hidden />
        <h2 className="hv-title mt-4 text-xl font-semibold tracking-normal">
          文章加载失败
        </h2>
        <p className="mt-2 text-sm text-cyan-50/60">
          可能是网络波动或这篇文章暂时不可用。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="hv-action px-5 py-2.5 text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            重试
          </button>
          <Link href="/posts" className="hv-action px-5 py-2.5 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            返回文章列表
          </Link>
          <Link
            href="/posts/random"
            prefetch={false}
            className="hv-action px-5 py-2.5 text-sm"
          >
            <Dices className="h-4 w-4" aria-hidden />
            随机一篇
          </Link>
        </div>
      </div>
    </div>
  );
}
