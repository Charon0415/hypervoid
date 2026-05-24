import Link from "next/link";
import type { ReactNode } from "react";

export function PlaceholderBanner({
  hint,
  editHref,
}: {
  hint?: string;
  editHref?: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-border bg-card/60 p-5 text-center text-sm text-muted">
      <p className="font-medium">⏳ 这个区域等待内容填充</p>
      <p className="mt-1.5 max-w-lg text-xs leading-relaxed">
        {hint ??
          "当前展示的是占位数据。后续可以从后台或直接编辑源文件来填充真实内容。"}
      </p>
      {editHref ? (
        <Link
          href={editHref}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs transition hover:border-primary/40 hover:text-primary"
        >
          前往编辑
          <svg
            aria-hidden
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}
