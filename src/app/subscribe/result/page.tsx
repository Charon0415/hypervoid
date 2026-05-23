import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "订阅结果",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, { title: string; body: string; tone: "ok" | "error" | "info" }> = {
  ok: {
    title: "订阅确认成功 🎉",
    body: "你已确认订阅。新文章发布时会发邮件通知你。",
    tone: "ok",
  },
  already: {
    title: "邮箱已订阅",
    body: "这个邮箱之前已经确认过了，无需重复确认。",
    tone: "info",
  },
  invalid: {
    title: "链接无效",
    body: "这个确认链接已过期或不正确，请重新订阅。",
    tone: "error",
  },
  missing: {
    title: "缺少 token",
    body: "请使用邮件里完整的链接打开。",
    tone: "error",
  },
  unsubscribed: {
    title: "已退订",
    body: "你已成功退订，以后不会再收到 Hypervoid 的邮件。随时可以再次订阅。",
    tone: "info",
  },
};

const TONE_CLASS: Record<string, string> = {
  ok: "border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950",
  error: "border-red-400/50 bg-red-50 dark:bg-red-950",
  info: "border-border bg-card",
};

export default async function SubscribeResult(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await props.searchParams;
  const m = MESSAGES[status] ?? MESSAGES.missing;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      <div
        className={`w-full rounded-xl border p-8 ${TONE_CLASS[m.tone]}`}
      >
        <h1 className="text-2xl font-bold tracking-tight">{m.title}</h1>
        <p className="mt-3 text-sm text-muted">{m.body}</p>
      </div>
      <Link
        href="/"
        className="rounded-md border border-border bg-card px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
      >
        返回首页
      </Link>
    </div>
  );
}
