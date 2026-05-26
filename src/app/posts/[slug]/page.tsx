import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
// KaTeX stylesheet — scoped to article pages so the ~50KB of CSS isn't
// pulled in on /posts, /tags, /home etc. when no math is rendered.
import "katex/dist/katex.min.css";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import { remarkVideoEmbed } from "@/lib/remark-video-embed";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { getAllPostSlugs, getAdjacentPosts, getBacklinks, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { mdxComponents } from "@/lib/mdx-components";
import { extractTOC } from "@/lib/toc";
import { transformerCodeMeta } from "@/lib/shiki-meta";
import { TableOfContents } from "@/components/TableOfContents";
import { Comments } from "@/components/Comments";
import { ViewCounter } from "@/components/ViewCounter";
import { ReactionBar } from "@/components/ReactionBar";
import { getReactionCounts } from "@/lib/reactions";
import { AskAI } from "@/components/AskAI";
import { PostNav } from "@/components/PostNav";
import { RelatedPosts } from "@/components/RelatedPosts";
import { Backlinks } from "@/components/Backlinks";
import { Webmentions } from "@/components/Webmentions";
import { listForSlug as listWebmentions } from "@/lib/webmentions";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ReadingMode } from "@/components/ReadingMode";
import { ShareButtons } from "@/components/ShareButtons";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ReadLaterButton } from "@/components/ReadLaterButton";
import { SeriesBanner } from "@/components/SeriesBanner";
import { ReadTracker } from "@/components/ReadTracker";
import { ArticleTopAnnouncement } from "@/components/ArticleTopAnnouncement";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { siteConfig } from "@/lib/site-config";
import { getViewer } from "@/lib/viewer";
import { getViewCount } from "@/db/posts-stats";
import { isAiConfigured } from "@/lib/ai";

type Params = { slug: string };

/**
 * ISR — cache rendered HTML for 5 minutes, invalidate via revalidatePath
 * from admin save / publish-scheduled cron. This is the highest-volume
 * route on the site and was previously force-dynamic, hitting Postgres
 * for full content + adjacent + related + backlinks + webmentions on
 * every visit. Trade-offs:
 *   - Admin-only UI affordances (e.g. "manage comments on GitHub" deep
 *     link) won't appear in cached pages because auth() doesn't run
 *     during SSG. Admin can still use /admin/posts/[slug]/edit.
 *   - View counter is client-side via recordView, unaffected by ISR.
 *   - Private/draft posts: SSG renders them as 404; admin previewing
 *     them must use the admin route.
 */
export const revalidate = 300;

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
  const description =
    post.frontmatter.description ?? post.frontmatter.summary ?? undefined;
  const canonical = `/posts/${slug}`;
  return {
    title: post.frontmatter.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.frontmatter.title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description,
    },
  };
}

export default async function PostPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const viewer = await getViewer();
  const post = await getPostBySlug(slug, { isAdmin: viewer.isAdmin });
  if (!post) notFound();

  const { frontmatter, content } = post;
  const toc = extractTOC(content);
  const [viewCount, reactionCounts, adjacent, related, backlinks, webmentions] = await Promise.all([
    getViewCount(slug),
    getReactionCounts(slug),
    getAdjacentPosts(slug, { isAdmin: viewer.isAdmin }),
    getRelatedPosts(slug, frontmatter.tags ?? [], { isAdmin: viewer.isAdmin }),
    getBacklinks(slug, { isAdmin: viewer.isAdmin }),
    listWebmentions(slug).catch(() => []),
  ]);
  const giscusRepo = process.env.NEXT_PUBLIC_GISCUS_REPO?.trim();
  const moderateUrl =
    viewer.isAdmin && giscusRepo
      ? `https://github.com/${giscusRepo}/discussions?discussions_q=${encodeURIComponent(`in:title /posts/${slug}`)}`
      : null;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
      <ArticleJsonLd
        url={`${siteConfig.url}/posts/${slug}`}
        title={frontmatter.title}
        description={frontmatter.description ?? null}
        cover={frontmatter.cover ?? null}
        publishedAt={frontmatter.date}
        updatedAt={frontmatter.updatedDate}
        authorName={siteConfig.author.name}
        authorUrl={siteConfig.author.githubUrl}
        tags={frontmatter.tags ?? []}
      />
      <ReadingProgress />
      <ReadTracker slug={slug} />
      <article className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
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
            <BookmarkButton
              slug={slug}
              title={frontmatter.title}
              description={frontmatter.description}
            />
            <ReadLaterButton
              slug={slug}
              title={frontmatter.title}
              description={frontmatter.description}
            />
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
            {frontmatter.visibility === "private" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                🔒 私密
              </span>
            ) : null}
            {frontmatter.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                📌 置顶
              </span>
            ) : null}
            <time>{frontmatter.date}</time>
            {frontmatter.updatedDate &&
            frontmatter.updatedDate !== frontmatter.date ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card/50 px-2 py-0.5 text-[11px] text-muted"
                title={`本文最后更新于 ${frontmatter.updatedDate}`}
              >
                ↻ 更新于 {frontmatter.updatedDate}
              </span>
            ) : null}
            {frontmatter.category ? (
              <>
                <span>·</span>
                <span>{frontmatter.category}</span>
              </>
            ) : null}
            <span>·</span>
            <span>
              {frontmatter.wordCount.toLocaleString()} 字 ·{" "}
              {frontmatter.readingMinutes} 分钟
            </span>
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
        <SeriesBanner post={post} />
        <ArticleTopAnnouncement />
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
                remarkPlugins: [remarkGfm, remarkMath, remarkAlert, remarkMermaid, remarkVideoEmbed],
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
        {reactionCounts !== null ? (
          <div className="mt-12 flex flex-col items-center gap-3">
            <ReactionBar slug={slug} initialCounts={reactionCounts} />
            {siteConfig.donate.enabled ? (
              <Link
                href="/donate"
                className="group inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-primary"
              >
                ☕ 觉得有用？请作者喝杯咖啡
                <svg
                  aria-hidden
                  className="h-3 w-3 transition group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </Link>
            ) : null}
          </div>
        ) : null}
        <PostNav prev={adjacent.prev} next={adjacent.next} />
        <div className="mt-6 flex justify-center">
          <Link
            href="/posts/random"
            prefetch={false}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted shadow-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <span
              aria-hidden
              className="text-base transition-transform group-hover:rotate-12"
            >
              🎲
            </span>
            随机一篇
          </Link>
        </div>
        <RelatedPosts posts={related} />
        <Backlinks posts={backlinks} />
        <Webmentions items={webmentions} />
        {isAiConfigured() ? (
          <section className="mt-12">
            <AskAI slug={slug} />
          </section>
        ) : null}
        <section className="mt-16 border-t border-border pt-8">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">评论</h2>
            {moderateUrl ? (
              <a
                href={moderateUrl}
                target="_blank"
                rel="noreferrer noopener"
                title="GitHub Discussions 是评论真实存储地。点这里跳到对应 discussion 删评论"
                className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted transition hover:border-primary/40 hover:text-primary"
              >
                🛡️ 在 GitHub 管理
                <svg
                  aria-hidden
                  className="h-3 w-3 transition group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H8M17 7v9" />
                </svg>
              </a>
            ) : null}
          </div>
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
