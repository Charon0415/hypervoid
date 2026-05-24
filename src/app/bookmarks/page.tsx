import type { Metadata } from "next";
import Link from "next/link";
import { BookmarksList } from "@/components/BookmarksList";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "本地收藏的文章列表",
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/"
        className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <svg
          aria-hidden
          className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        首页
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest text-primary">
          Bookmarks · 收藏夹
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">我的收藏</h1>
        <p className="mt-2 text-sm text-muted">
          只存在你这台设备的浏览器里，不会同步到其它设备。换设备或清除浏览器数据后会丢失。
        </p>
      </header>

      <BookmarksList />
    </div>
  );
}
