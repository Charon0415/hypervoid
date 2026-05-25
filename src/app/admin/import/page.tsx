import type { Metadata } from "next";
import { ImportForm } from "@/components/admin/ImportForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "导入文章",
  robots: { index: false, follow: false },
};

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">导入文章</h1>
      </header>
      <div className="max-w-2xl">
        <ImportForm />
      </div>
      <div className="max-w-2xl rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <p className="font-medium text-foreground">格式说明</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>支持标准 Markdown + YAML frontmatter</li>
          <li>导入状态为「草稿」，需手动发布</li>
          <li>slug 由文件名生成（中文会保留）</li>
          <li>如 slug 已存在则跳过该文件</li>
        </ul>
      </div>
    </div>
  );
}
