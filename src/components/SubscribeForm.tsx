"use client";

import { useState, useTransition } from "react";

export function SubscribeForm({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { type: "ok" | "error"; text: string } | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (res.ok && data.ok) {
          setMessage({
            type: "ok",
            text: "✓ 验证邮件已发到你的邮箱，点击邮件里的确认链接即可。",
          });
          setEmail("");
        } else {
          setMessage({
            type: "error",
            text: data.error ?? `订阅失败 (${res.status})`,
          });
        }
      } catch (e) {
        setMessage({ type: "error", text: (e as Error).message });
      }
    });
  };

  const isCompact = variant === "compact";

  return (
    <div className={isCompact ? "" : "rounded-xl border border-border bg-card p-6"}>
      {!isCompact ? (
        <>
          <h3 className="text-lg font-semibold tracking-tight">订阅更新</h3>
          <p className="mt-1 text-sm text-muted">
            新文章发布时通过邮件通知你，不发别的。随时退订。
          </p>
        </>
      ) : null}
      <form
        onSubmit={onSubmit}
        className={`${isCompact ? "" : "mt-4"} flex flex-col gap-2 sm:flex-row`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
          aria-label="邮箱"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "提交中…" : "订阅"}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-sm ${
            message.type === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
