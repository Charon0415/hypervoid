"use client";

import { useTheme } from "next-themes";
import Giscus from "@giscus/react";

const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO?.trim() as
  | `${string}/${string}`
  | undefined;
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim();
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim();
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim();

export function CommentsImpl() {
  const { resolvedTheme } = useTheme();

  if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
        💬 评论功能尚未启用：需要在环境变量中配置 Giscus（NEXT_PUBLIC_GISCUS_*）。
      </div>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={REPO}
      repoId={REPO_ID}
      category={CATEGORY}
      categoryId={CATEGORY_ID}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="zh-CN"
      loading="lazy"
    />
  );
}
