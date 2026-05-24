import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import { getAllPostSlugs, getAdjacentPosts, getPostBySlug } from "@/lib/posts";
import { mdxComponents } from "@/lib/mdx-components";
import { extractTOC } from "@/lib/toc";
import { transformerCodeMeta } from "@/lib/shiki-meta";
import { TableOfContents } from "@/components/TableOfContents";
import { Comments } from "@/components/Comments";
import { ViewCounter } from "@/components/ViewCounter";
import { LikeButton } from "@/components/LikeButton";
import { AskAI } from "@/components/AskAI";
import { PostNav } from "@/components/PostNav";
import { getLikeCount, getViewCount } from "@/db/posts-stats";
import { isAiConfigured } from "@/lib/ai";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description ?? undefined,
  };
}

export default async function PostPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const toc = extractTOC(content);
  const [viewCount, likeCount, adjacent] = await Promise.all([
    getViewCount(slug),
    getLikeCount(slug),
    getAdjacentPosts(slug),
  ]);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/posts"
          className="text-sm text-muted hover:text-primary"
        >
          ← 返回文章列表
        </Link>
        <header className="mt-4 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {frontmatter.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            {frontmatter.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                📌 置顶
              </span>
            ) : null}
            <time>{frontmatter.date}</time>
            {frontmatter.category ? (
              <>
                <span>·</span>
                <span>{frontmatter.category}</span>
              </>
            ) : null}
            <span>·</span>
            <span>{frontmatter.readingMinutes} 分钟阅读</span>
            {viewCount !== null ? (
              <>
                <span>·</span>
                <ViewCounter slug={slug} initialCount={viewCount} />
              </>
            ) : null}
            {frontmatter.tags?.length ? (
              <>
                <span>·</span>
                <span className="flex flex-wrap gap-1.5">
                  {frontmatter.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition hover:bg-primary/15"
                    >
                      #{tag}
                    </Link>
                  ))}
                </span>
              </>
            ) : null}
          </div>
          {frontmatter.description ? (
            <p className="mt-3 text-base text-muted">
              {frontmatter.description}
            </p>
          ) : null}
        </header>
        {frontmatter.summary ? (
          <aside className="mt-8 rounded-md border-l-4 border-primary bg-primary/5 p-4">
            <p className="mb-1 text-xs uppercase tracking-wider text-primary">
              ✦ AI 摘要
            </p>
            <p className="text-sm leading-relaxed">{frontmatter.summary}</p>
          </aside>
        ) : null}
        <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath, remarkAlert],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    { behavior: "wrap", properties: { className: ["heading-anchor"] } },
                  ],
                  rehypeKatex,
                  [
                    rehypeShiki,
                    {
                      themes: { light: "github-light", dark: "github-dark" },
                      transformers: [transformerCodeMeta],
                      langs: [
                        "ts",
                        "tsx",
                        "js",
                        "jsx",
                        "json",
                        "md",
                        "mdx",
                        "bash",
                        "sh",
                        "css",
                        "html",
                        "yaml",
                        "python",
                      ],
                    },
                  ],
                ],
              },
            }}
          />
        </div>
        {likeCount !== null ? (
          <div className="mt-12 flex justify-center">
            <LikeButton slug={slug} initialCount={likeCount} />
          </div>
        ) : null}
        <PostNav prev={adjacent.prev} next={adjacent.next} />
        {isAiConfigured() ? (
          <section className="mt-12">
            <AskAI slug={slug} />
          </section>
        ) : null}
        <section className="mt-16 border-t border-border pt-8">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">评论</h2>
          <Comments />
        </section>
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TableOfContents items={toc} />
        </div>
      </aside>
    </div>
  );
}
