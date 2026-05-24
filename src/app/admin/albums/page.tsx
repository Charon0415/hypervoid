import Link from "next/link";
import type { Metadata } from "next";
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
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">相册管理</h1>
          <span className="text-sm text-muted">共 {albums.length} 个</span>
        </div>
        <Link
          href="/admin/albums/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + 新建相册
        </Link>
      </header>

      {albums.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有相册。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/admin/albums/${a.id}/edit`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
            >
              {a.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.coverUrl}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="aspect-video w-full bg-primary/5" />
              )}
              <div className="p-4">
                <p className="font-semibold group-hover:text-primary">
                  {a.name}
                </p>
                <p className="text-xs text-muted">
                  /albums/{a.slug} · #{a.sortOrder}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
