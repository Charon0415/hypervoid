"use client";

import { useState, useTransition } from "react";
import { broadcastPostAction } from "@/app/admin/posts/actions";

export function BroadcastButton({
  slug,
  status,
  notifiedAt,
  subscriberCount,
}: {
  slug: string;
  status: "draft" | "scheduled" | "published";
  notifiedAt: Date | null;
  subscriberCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { sent: number; failed: number; errors: string[]; alreadyNotified: boolean } | null
  >(null);

  if (status !== "published") {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-muted">
        ✉️ 邮件群发只能在已发布状态下进行。
      </div>
    );
  }

  if (notifiedAt && !result) {
    return (
      <div className="rounded-md border border-emerald-400/50 bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
        ✓ 这篇文章已经群发过（{notifiedAt.toISOString().slice(0, 16).replace("T", " ")}）。
      </div>
    );
  }

  const onSend = () => {
    if (
      !confirm(
        `确认向 ${subscriberCount} 个订阅者群发此文章？此操作不可撤销。`,
      )
    )
      return;
    startTransition(async () => {
      try {
        const r = await broadcastPostAction(slug);
        setResult(r);
      } catch (e) {
        setResult({
          sent: 0,
          failed: 0,
          errors: [(e as Error).message],
          alreadyNotified: false,
        });
      }
    });
  };

  return (
    <div className="rounded-md border border-border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">订阅通知</p>
          <p className="mt-0.5 text-xs text-muted">
            当前订阅者：{subscriberCount}
          </p>
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={pending || subscriberCount === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "群发中…" : "向订阅者群发 ✉️"}
        </button>
      </div>
      {result ? (
        <div className="mt-3 space-y-1 text-xs">
          {result.alreadyNotified ? (
            <p className="text-muted">已群发过，跳过。</p>
          ) : (
            <>
              <p>
                成功：<span className="text-emerald-600 dark:text-emerald-400">{result.sent}</span>
                {result.failed > 0 ? (
                  <>
                    {" · "}失败：
                    <span className="text-red-600 dark:text-red-400">{result.failed}</span>
                  </>
                ) : null}
              </p>
              {result.errors.length > 0 ? (
                <details>
                  <summary className="cursor-pointer text-muted">错误明细</summary>
                  <ul className="mt-1 list-inside list-disc">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-red-600 dark:text-red-400">
                        {e}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
