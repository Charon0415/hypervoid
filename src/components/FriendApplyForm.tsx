"use client";

import { useState, useRef } from "react";

export function FriendApplyForm() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted">
        想交换友链？
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 text-primary underline underline-offset-2 hover:opacity-80"
        >
          点此申请
        </button>
      </p>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setDone(null);
    const fd = new FormData(e.target as HTMLFormElement);
    const body: Record<string, string> = {};
    fd.forEach((v, k) => { body[k] = String(v); });
    try {
      const res = await fetch("/api/friends/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(data.message ?? "已提交");
        formRef.current?.reset();
      } else {
        setError(data.error ?? "提交失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold">申请友链</h3>
      {done ? (
        <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {done}
        </p>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
          {/* Honeypot */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden>
            <input type="text" name="_website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">名称 *</span>
              <input
                name="name"
                required
                maxLength={30}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="博客名称"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">网址 *</span>
              <input
                name="url"
                type="url"
                required
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="https://"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">简介</span>
            <input
              name="description"
              maxLength={120}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="简短介绍你的博客（可选）"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              name="email"
              type="email"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="审核通过后通知你（可选）"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "提交中..." : "提交申请"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
