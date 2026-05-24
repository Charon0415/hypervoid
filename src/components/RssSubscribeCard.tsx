import Link from "next/link";

export function RssSubscribeCard() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h3 className="text-lg font-semibold tracking-tight">订阅更新</h3>
      <p className="mt-1 text-sm text-muted">
        邮件订阅暂未开放，可以通过 RSS 阅读器（Feedly / Inoreader / NetNewsWire 等）获取新文章。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/rss.xml"
          prefetch={false}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
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
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          RSS 订阅
        </Link>
        <Link
          href="/rss.xml"
          prefetch={false}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-muted transition hover:border-primary hover:text-primary"
        >
          复制订阅链接
        </Link>
      </div>
    </div>
  );
}
