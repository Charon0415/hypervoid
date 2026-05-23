import Link from "next/link";
import type { Metadata } from "next";
import { listAlbums } from "@/db/albums";

export const revalidate = 60;

export const metadata: Metadata = { title: "相册" };

export default async function AlbumsPage() {
  const albums = await listAlbums();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">相册</h1>
        <p className="mt-2 text-muted">照片、旅行记录、生活瞬间。</p>
      </header>
      {albums.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有相册。
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/albums/${a.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary hover:shadow-md"
            >
              {a.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.coverUrl}
                  alt=""
                  className="aspect-video w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="aspect-video w-full bg-primary/5" />
              )}
              <div className="p-4">
                <p className="font-semibold group-hover:text-primary">
                  {a.name}
                </p>
                {a.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {a.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
