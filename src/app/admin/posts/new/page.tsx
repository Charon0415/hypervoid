import Link from "next/link";
import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { createPostAction } from "@/app/admin/posts/actions";

export const metadata: Metadata = {
  title: "新建文章",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline gap-3">
        <Link
          href="/admin/posts"
          className="text-sm text-muted hover:text-primary"
        >
          ← 文章列表
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">新建文章</h1>
      </header>
      <PostEditor mode="new" onSubmit={createPostAction} />
    </div>
  );
}
