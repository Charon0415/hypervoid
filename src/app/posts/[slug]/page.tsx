import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { mdxComponents } from "@/lib/mdx-components";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function PostPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;

  return (
    <article className="mx-auto max-w-3xl">
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
          <time>{frontmatter.date}</time>
          {frontmatter.category ? (
            <>
              <span>·</span>
              <span>{frontmatter.category}</span>
            </>
          ) : null}
          {frontmatter.tags?.length ? (
            <>
              <span>·</span>
              <span className="flex flex-wrap gap-1.5">
                {frontmatter.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
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
      <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  { behavior: "wrap", properties: { className: ["heading-anchor"] } },
                ],
                [
                  rehypeShiki,
                  {
                    themes: { light: "github-light", dark: "github-dark" },
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
    </article>
  );
}
