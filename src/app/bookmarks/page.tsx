import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { BookmarksList } from "@/components/BookmarksList";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "本地收藏的文章列表",
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/" className="hv-action w-fit px-4 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        首页
      </Link>

      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker">Local vault / browser storage</p>
        <h1 className="hv-title mt-2 flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
          <Bookmark className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
          我的收藏
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/62">
          只存在你这台设备的浏览器里，不会同步到其它设备。换设备或清除浏览器数据后会丢失。
        </p>
      </header>

      <BookmarksList />
    </div>
  );
}
