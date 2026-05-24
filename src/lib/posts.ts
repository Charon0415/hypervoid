import "server-only";

import { and, desc, eq, lte, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { estimateReadingTime } from "@/lib/reading-time";

export type PostFrontmatter = {
  title: string;
  description?: string | null;
  date: string;
  tags: string[];
  category?: string | null;
  cover?: string | null;
  summary?: string | null;
  pinned?: boolean;
  readingMinutes: number;
  draft?: boolean;
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

function visibleClause() {
  return or(
    eq(schema.posts.status, "published"),
    and(
      eq(schema.posts.status, "scheduled"),
      lte(schema.posts.publishAt, sql`NOW()`),
    ),
  );
}

function toPost(row: typeof schema.posts.$inferSelect): Post {
  const dateSource = row.publishAt ?? row.createdAt;
  const { minutes } = estimateReadingTime(row.content);
  return {
    slug: row.slug,
    content: row.content,
    frontmatter: {
      title: row.title,
      description: row.description,
      date: dateSource.toISOString().slice(0, 10),
      tags: row.tags ?? [],
      category: row.category,
      cover: row.cover,
      summary: row.summary,
      pinned: row.pinned,
      readingMinutes: minutes,
      draft: row.status === "draft",
    },
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  const rows = await getDb()
    .select({ slug: schema.posts.slug })
    .from(schema.posts)
    .where(visibleClause());
  return rows.map((r) => r.slug);
}

export async function getAllPosts(): Promise<Post[]> {
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(visibleClause())
    .orderBy(
      desc(schema.posts.pinned),
      desc(schema.posts.publishAt),
      desc(schema.posts.createdAt),
    );
  return rows.map(toPost);
}

export type PopularPost = {
  slug: string;
  title: string;
  views: number;
};

export async function getPopularPosts(limit = 5): Promise<PopularPost[]> {
  const rows = await getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      views: sql<number>`COALESCE(${schema.postViews.count}, 0)::int`,
    })
    .from(schema.posts)
    .leftJoin(schema.postViews, eq(schema.posts.slug, schema.postViews.slug))
    .where(visibleClause())
    .orderBy(
      desc(sql`COALESCE(${schema.postViews.count}, 0)`),
      desc(schema.posts.publishAt),
    )
    .limit(limit);
  return rows;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.slug, slug), visibleClause()))
    .limit(1);
  return rows[0] ? toPost(rows[0]) : null;
}

export type AdjacentPost = { slug: string; title: string };

export async function getAdjacentPosts(slug: string): Promise<{
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}> {
  const rows = await getDb()
    .select({ slug: schema.posts.slug, title: schema.posts.title })
    .from(schema.posts)
    .where(visibleClause())
    .orderBy(desc(schema.posts.publishAt), desc(schema.posts.createdAt));
  const i = rows.findIndex((r) => r.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? rows[i - 1] : null,
    next: i < rows.length - 1 ? rows[i + 1] : null,
  };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.frontmatter.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.frontmatter.tags.includes(tag));
}

export type SearchHit = Post & { score: number };

export async function searchPosts(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;

  const rows = await getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      description: schema.posts.description,
      content: schema.posts.content,
      category: schema.posts.category,
      tags: schema.posts.tags,
      cover: schema.posts.cover,
      summary: schema.posts.summary,
      pinned: schema.posts.pinned,
      status: schema.posts.status,
      publishAt: schema.posts.publishAt,
      notifiedAt: schema.posts.notifiedAt,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      score: sql<number>`GREATEST(
        similarity(${schema.posts.title}, ${q}),
        similarity(coalesce(${schema.posts.description}, ''), ${q}) * 0.6,
        similarity(${schema.posts.content}, ${q}) * 0.3
      )`,
    })
    .from(schema.posts)
    .where(
      and(
        visibleClause(),
        sql`(${schema.posts.title} || ' ' || coalesce(${schema.posts.description}, '') || ' ' || ${schema.posts.content}) ILIKE ${pattern}`,
      ),
    )
    .orderBy(
      sql`GREATEST(
        similarity(${schema.posts.title}, ${q}),
        similarity(coalesce(${schema.posts.description}, ''), ${q}) * 0.6,
        similarity(${schema.posts.content}, ${q}) * 0.3
      ) DESC NULLS LAST`,
      desc(schema.posts.publishAt),
    )
    .limit(50);

  return rows.map((row) => ({
    ...toPost(row),
    score: row.score ?? 0,
  }));
}
