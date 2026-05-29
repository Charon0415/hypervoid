import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { listAlbums } from "@/db/albums";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "相册管理",
  robots: { index: false, follow: false },
};

export default async function AdminAlbumsList() {
  const albums = await listAlbums();

  return (
    <div className="flex flex-col gap-6">
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Album Registry</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">相册管理</h1>
            <p className="mt-2 text-sm text-muted">共 {albums.length} 个影像集合。</p>
          </div>
        </div>
        <Link href="/admin/albums/new" className="hv-action px-4 text-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          新建相册
        </Link>
      </header>

      {albums.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">还没有相册。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link key={a.id} href={"/admin/albums/" + a.id + "/edit"} className="hv-panel hv-panel-hover group overflow-hidden p-0">
              {a.coverUrl ? (
                <Image src={a.coverUrl} alt="" width={480} height={270} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw" className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div className="aspect-video w-full bg-cyan-300/8" />
              )}
              <div className="p-4">
                <p className="font-semibold text-cyan-50 group-hover:text-white">{a.name}</p>
                <p className="font-mono text-xs text-muted">/albums/{a.slug} · #{a.sortOrder}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
