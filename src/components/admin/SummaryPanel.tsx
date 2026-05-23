"use client";

import { useState, useTransition } from "react";
import {
  clearSummaryAction,
  generateSummaryAction,
} from "@/app/admin/posts/actions";

export function SummaryPanel({
  slug,
  initialSummary,
}: {
  slug: string;
  initialSummary: string | null;
}) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateSummaryAction(slug);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSummary(result.summary);
      }
    });
  };

  const onClear = () => {
    if (!confirm("清除当前摘要？")) return;
    startTransition(async () => {
      await clearSummaryAction(slug);
      setSummary(null);
    });
  };

  return (
    <div className="rounded-md border border-border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">AI 摘要</p>
          <p className="mt-0.5 text-xs text-muted">
            Claude Haiku 自动生成 2-3 句中文摘要，展示在文章正文上方
          </p>
        </div>
        <div className="flex gap-2">
          {summary ? (
            <button
              type="button"
              onClick={onClear}
              disabled={pending}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:border-primary disabled:opacity-50"
            >
              清除
            </button>
          ) : null}
          <button
            type="button"
            onClick={onGenerate}
            disabled={pending}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "生成中…" : summary ? "重新生成" : "✦ 生成摘要"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {summary ? (
        <p className="mt-3 rounded-md border border-border bg-background p-3 text-sm">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
