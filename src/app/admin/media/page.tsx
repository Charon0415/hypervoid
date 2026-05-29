import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Trash2 } from "lucide-react";
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
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  if (!isBlobConfigured()) {
    return (
      <div className="flex flex-col gap-6">
        <header className="hv-panel p-5">
          <AdminBackLink href="/admin" label="后台" />
          <p className="hv-kicker mt-4">Media Vault</p>
          <h1 className="hv-title mt-1 text-2xl font-semibold">图库管理</h1>
        </header>
        <p className="hv-panel border-amber-300/35 border-dashed p-6 text-sm text-amber-100">
          缺少 <code>BLOB_READ_WRITE_TOKEN</code>，无法读取 Vercel Blob 列表。请先在 Vercel 项目中关联 Blob Store。
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
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Media Vault</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">图库管理</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              所有 <code>BLOB_READ_WRITE_TOKEN</code> 关联的图片。引用计数基于文章正文与封面的全文匹配。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="hv-chip">{items.length} 张</span>
          <span className="hv-chip">{formatBytes(totalSize)}</span>
          <span className={orphanCount > 0 ? "border border-amber-300/35 bg-amber-400/10 px-2 py-0.5 font-mono text-xs text-amber-100" : "hv-chip"}>{orphanCount} 张未引用</span>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">Blob 里还没有图。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const refCount = refs.get(item.url) ?? 0;
            return (
              <div key={item.url} className="hv-panel overflow-hidden p-0">
                <div className="relative aspect-video overflow-hidden bg-black/40">
                  <Image
                    src={item.url}
                    alt={item.pathname}
                    width={480}
                    height={270}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                  />
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    {refCount === 0 ? (
                      <span className="dark-locked border border-amber-200/50 bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white">孤儿</span>
                    ) : (
                      <span className="dark-locked border border-emerald-200/50 bg-emerald-500/90 px-2 py-0.5 text-[10px] font-medium text-white">被引用 ×{refCount}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3 text-xs">
                  <p className="truncate font-mono text-[11px] text-muted" title={item.pathname}>{item.pathname}</p>
                  <span className="font-mono text-[10px] text-muted">{formatBytes(item.size)} · {formatDateTimeCN(item.uploadedAt)}</span>
                  <div className="flex flex-wrap gap-1.5">
                    <CopyUrlButton url={item.url} />
                    <a href={item.url} target="_blank" rel="noreferrer" className="hv-action min-h-0 px-2 py-0.5 text-[11px]">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      原图
                    </a>
                    <form
                      action={async () => {
                        "use server";
                        await deleteBlobAction(item.url);
                      }}
                      className="ml-auto"
                    >
                      <button type="submit" className="inline-flex items-center gap-1 border border-red-400/35 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200 transition hover:border-red-300 hover:bg-red-500/15">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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

      <p className="text-xs text-muted">删除是 Vercel Blob 上的真删除，无法撤销；正在被文章引用的图建议保留。</p>
    </div>
  );
}
