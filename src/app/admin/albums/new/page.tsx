import Link from "next/link";
import type { Metadata } from "next";
import { AlbumForm } from "@/components/admin/AlbumForm";
import { createAlbumAction } from "@/app/admin/albums/actions";

export const metadata: Metadata = {
  title: "新建相册",
  robots: { index: false, follow: false },
};

export default function NewAlbumPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline gap-3">
        <Link
          href="/admin/albums"
          className="text-sm text-muted hover:text-primary"
        >
          ← 相册列表
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">新建相册</h1>
      </header>
      <AlbumForm mode="new" onSubmit={createAlbumAction} />
    </div>
  );
}
