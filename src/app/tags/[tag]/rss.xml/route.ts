import { notFound } from "next/navigation";
import { getPostsByTag } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ tag: string }> },
): Promise<Response> {
  const { tag: rawTag } = await ctx.params;
  const tag = decodeURIComponent(rawTag);
  const posts = await getPostsByTag(tag);
  if (posts.length === 0) notFound();

  const buildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/posts/${post.slug}`;
      const pubDate = post.frontmatter.date
        ? new Date(post.frontmatter.date).toUTCString()
        : buildDate;
      const description = post.frontmatter.description
        ? `<description>${escapeXml(post.frontmatter.description)}</description>`
        : "";
      const categories = (post.frontmatter.tags ?? [])
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join("");
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(siteConfig.author.name)} (${escapeXml(siteConfig.author.handle)})</author>
      ${description}${categories}
    </item>`;
    })
    .join("\n");

  const selfHref = `${siteConfig.url}/tags/${encodeURIComponent(tag)}/rss.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.rss.title} · #${tag}`)}</title>
    <link>${siteConfig.url}/tags/${encodeURIComponent(tag)}</link>
    <description>${escapeXml(`${siteConfig.name} 标签 #${tag} 的文章订阅`)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
