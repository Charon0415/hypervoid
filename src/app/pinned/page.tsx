import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getAllPostMeta } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "置顶文章",
  description: "标记为置顶的文章精选",
};

export default async function PinnedPage() {
  const posts = await getAllPostMeta();
  const pinned = posts.filter((p) => p.frontmatter.pinned);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary">
          📌 Pinned
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          置顶文章
        </h1>
        <p className="mt-2 text-sm text-muted">
          {pinned.length > 0
            ? `共 ${pinned.length} 篇精选`
            : "暂无置顶文章"}
        </p>
      </header>

      {pinned.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-5xl" aria-hidden>
            📌
          </p>
          <p className="mt-3 text-muted">
            管理员可以在文章编辑器中勾选&ldquo;置顶&rdquo;。
          </p>
        </div>
      ) : (
        <div className="card-stagger flex flex-col gap-4">
          {pinned.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
