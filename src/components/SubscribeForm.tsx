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
    <div className={isCompact ? "" : "hv-panel-sci group relative overflow-hidden p-6 sm:p-8"}>
      {!isCompact ? (
        <>
          {/* Corner accent */}
          <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-20 bg-gradient-to-r from-cyan-400/60 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-20 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <h3 className="font-mono text-sm font-semibold uppercase tracking-widest text-cyan-100/80">
              Subscribe_Updates
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cyan-50/70">
            新文章发布时通过邮件通知你，不发别的。随时退订。
          </p>
        </>
      ) : null}
      <form
        onSubmit={onSubmit}
        className={`${isCompact ? "" : "mt-5"} flex flex-col gap-2 sm:flex-row`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="hv-input flex-1 border border-cyan-100/18 bg-cyan-950/30 px-4 py-2.5 text-sm text-cyan-50 placeholder:text-cyan-50/40 transition focus:border-cyan-400/50 focus:bg-cyan-950/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          aria-label="邮箱"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.12)] transition hover:border-cyan-400/60 hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(103,232,249,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_16px_rgba(103,232,249,0.12)]"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
        >
          {pending ? "提交中…" : "订阅"}
          {!pending ? (
            <svg
              aria-hidden
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          ) : null}
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
