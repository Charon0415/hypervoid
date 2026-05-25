import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { isBlobConfigured, listAllBlobs } from "@/lib/blob";
import { countPostReferences } from "@/lib/media-refs";
import { formatDateTimeCN } from "@/lib/datetime";
import { deleteBlobAction } from "./actions";
import { CopyUrlButton } from "./CopyUrlButton";

export const metadata: Metadata = {
  title: "图库管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  if (!isBlobConfigured()) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">图库管理</h1>
        </header>
        <p className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-700 dark:text-amber-300">
          缺少 <code>BLOB_READ_WRITE_TOKEN</code>，无法读取 Vercel Blob 列表。
          请先在 Vercel 项目中关联 Blob Store。
        </p>
      </div>
    );
  }

  const items = await listAllBlobs();
  const refs = await countPostReferences(items.map((i) => i.url));

  const totalSize = items.reduce((sum, i) => sum + i.size, 0);
  const orphanCount = [...refs.values()].filter((v) => v === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">图库管理</h1>
        <span className="text-sm text-muted">
          {items.length} 张 · {formatBytes(totalSize)} · {orphanCount} 张未被引用
        </span>
      </header>

      <p className="text-sm text-muted">
        所有 <code>BLOB_READ_WRITE_TOKEN</code> 关联的图片。
        「被引用」基于文章正文与封面的全文匹配，删除前请确认引用计数。
      </p>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          Blob 里还没有图。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const refCount = refs.get(item.url) ?? 0;
            return (
              <div
                key={item.url}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-video overflow-hidden bg-background">
                  <Image
                    src={item.url}
                    alt={item.pathname}
                    width={480}
                    height={270}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {refCount === 0 ? (
                      <span className="dark-locked rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                        孤儿
                      </span>
                    ) : (
                      <span className="dark-locked rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                        被引用 ×{refCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3 text-xs">
                  <p className="truncate font-mono text-[11px] text-muted" title={item.pathname}>
                    {item.pathname}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted">
                      {formatBytes(item.size)} · {formatDateTimeCN(item.uploadedAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <CopyUrlButton url={item.url} />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] transition hover:border-primary hover:text-primary"
                    >
                      原图
                    </a>
                    <form
                      action={async () => {
                        "use server";
                        await deleteBlobAction(item.url);
                      }}
                      className="ml-auto"
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-500/30 bg-red-500/5 px-2 py-0.5 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                      >
                        删除
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted">
        删除是 Vercel Blob 上的真删除，无法撤销；正在被文章引用的图建议保留。
      </p>
    </div>
  );
}
