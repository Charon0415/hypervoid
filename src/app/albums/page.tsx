import type { Metadata } from "next";

export const metadata: Metadata = { title: "相册" };

export default function AlbumsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">相册</h1>
        <p className="mt-2 text-muted">
          照片、旅行记录、生活瞬间。后续会接入图床或对象存储。
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border border-dashed border-border bg-card"
          />
        ))}
      </div>
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
        ⏳ 占位卡片，后续接入图床后会展示真实照片。
      </p>
    </div>
  );
}
