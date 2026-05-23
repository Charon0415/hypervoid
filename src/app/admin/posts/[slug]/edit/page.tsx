import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PostEditor,
  postRowToInitial,
} from "@/components/admin/PostEditor";
import { getPostForEditing } from "@/db/admin-posts";
import {
  deletePostAction,
  updatePostAction,
} from "@/app/admin/posts/actions";

type Params = { slug: string };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostForEditing(slug);
  return {
    title: post ? `编辑 · ${post.title}` : "编辑文章",
    robots: { index: false, follow: false },
  };
}

export default async function EditPostPage(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const post = await getPostForEditing(slug);
  if (!post) notFound();

  const initial = postRowToInitial(post);

  const updateBound = updatePostAction.bind(null, slug);
  const deleteBound = deletePostAction.bind(null, slug);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <Link
            href="/admin/posts"
            className="text-sm text-muted hover:text-primary"
          >
            ← 文章列表
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
        </div>
        <Link
          href={`/posts/${slug}`}
          target="_blank"
          rel="noreferrer noopener"
          className="text-sm text-muted hover:text-primary"
        >
          线上预览 ↗
        </Link>
      </header>
      <PostEditor
        mode="edit"
        initial={initial}
        onSubmit={updateBound}
        onDelete={deleteBound}
      />
    </div>
  );
}
