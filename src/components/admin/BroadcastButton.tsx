"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { broadcastPostAction } from "@/app/admin/posts/actions";
import { formatDateTimeCN } from "@/lib/datetime-client";

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
      <div className="hv-panel border-dashed p-4 text-sm text-muted">
        邮件群发只能在已发布状态下进行。
      </div>
    );
  }

  if (notifiedAt && !result) {
    return (
      <div className="hv-panel border-emerald-300/35 bg-emerald-400/10 p-4 text-sm text-emerald-100">
        这篇文章已经群发过（{formatDateTimeCN(notifiedAt)}）。
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
    <div className="hv-panel p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-cyan-50">订阅通知</p>
          <p className="mt-0.5 text-xs text-muted">
            当前订阅者：{subscriberCount}
          </p>
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={pending || subscriberCount === 0}
          className="hv-action hv-chip-strong px-4 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "群发中…" : (<><Send className="h-4 w-4" aria-hidden="true" />向订阅者群发</>)}
        </button>
      </div>
      {result ? (
        <div className="mt-3 space-y-1 text-xs">
          {result.alreadyNotified ? (
            <p className="text-muted">已群发过，跳过。</p>
          ) : (
            <>
              <p>
                成功：<span className="text-emerald-200">{result.sent}</span>
                {result.failed > 0 ? (
                  <>
                    {" · "}失败：
                    <span className="text-red-200">{result.failed}</span>
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
