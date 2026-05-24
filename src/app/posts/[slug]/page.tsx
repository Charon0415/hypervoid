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
import { ReadingProgress } from "@/components/ReadingProgress";
import { ReadingMode } from "@/components/ReadingMode";
import { ShareButtons } from "@/components/ShareButtons";
import { siteConfig } from "@/lib/site-config";
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
      <ReadingProgress />
      <article className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <svg
              aria-hidden
              className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            返回文章列表
          </Link>
          <div className="flex items-center gap-1">
            <ReadingMode />
            <ShareButtons
              title={frontmatter.title}
              url={`${siteConfig.url}/posts/${slug}`}
            />
          </div>
        </div>
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
