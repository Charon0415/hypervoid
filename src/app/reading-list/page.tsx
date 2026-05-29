import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { ReadLaterList } from "@/components/ReadLaterList";

export const metadata: Metadata = {
  title: "稍后读",
  description: "本地稍后读队列",
  robots: { index: false, follow: false },
};

export default function ReadingListPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/" className="hv-action w-fit px-4 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        首页
      </Link>

      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker">Reading queue / local cache</p>
        <h1 className="hv-title mt-2 flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
          <Clock3 className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
          稍后读
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/62">
          收藏想读但还没空看的文章，只存在这台设备的浏览器里。想长期保存的请用{" "}
          <Link href="/bookmarks" className="text-cyan-100 underline-offset-4 hover:underline">
            收藏夹
          </Link>
          。
        </p>
      </header>

      <ReadLaterList />
    </div>
  );
}
