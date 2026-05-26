import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <svg
        aria-hidden
        viewBox="0 0 120 120"
        className="h-28 w-28 text-muted"
      >
        <rect width="120" height="120" rx="22" fill="#0b0f1a" />
        <path
          d="M30 70 C30 45, 90 45, 90 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M42 78 C42 60, 78 60, 78 78"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="60" cy="88" r="4" fill="currentColor" />
        <line
          x1="60"
          y1="30"
          x2="60"
          y2="50"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="48"
          y1="35"
          x2="55"
          y2="52"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
        <line
          x1="72"
          y1="35"
          x2="65"
          y2="52"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          你已离线
        </h1>
        <p className="mt-2 text-sm text-muted">
          网络连接不可用。已缓存的页面仍可浏览，连接恢复后会自动刷新。
        </p>
      </div>

      <Link
        href="/"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5"
      >
        返回首页
      </Link>
    </div>
  );
}
