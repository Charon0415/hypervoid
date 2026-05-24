import "server-only";

import { and, desc, eq, lte, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { estimateReadingTime } from "@/lib/reading-time";
import { formatDateCN } from "@/lib/datetime";

export type PostFrontmatter = {
  title: string;
  description?: string | null;
  date: string;
  updatedDate: string;
  tags: string[];
  category?: string | null;
  cover?: string | null;
  summary?: string | null;
  pinned?: boolean;
  readingMinutes: number;
  draft?: boolean;
  visibility: "public" | "private";
  series?: string | null;
  seriesOrder?: number | null;
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

export type ViewerOpts = { isAdmin?: boolean };

function visibilityClause(isAdmin: boolean) {
  if (isAdmin) return undefined;
  return eq(schema.posts.visibility, "public");
}

function publishedClause() {
  return or(
    eq(schema.posts.status, "published"),
    and(
      eq(schema.posts.status, "scheduled"),
      lte(schema.posts.publishAt, sql`NOW()`),
    ),
  );
}

function visibleClause(isAdmin: boolean) {
  const vc = visibilityClause(isAdmin);
  const pc = publishedClause();
  return vc ? and(vc, pc) : pc;
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
      date: formatDateCN(dateSource),
      updatedDate: formatDateCN(row.updatedAt),
      tags: row.tags ?? [],
      category: row.category,
      cover: row.cover,
      summary: row.summary,
      pinned: row.pinned,
      readingMinutes: minutes,
      draft: row.status === "draft",
      visibility: row.visibility,
      series: row.series,
      seriesOrder: row.seriesOrder,
    },
  };
}

export async function getAllPostSlugs(opts: ViewerOpts = {}): Promise<string[]> {
  const rows = await getDb()
    .select({ slug: schema.posts.slug })
    .from(schema.posts)
    .where(visibleClause(opts.isAdmin === true));
  return rows.map((r) => r.slug);
}

export async function getAllPosts(opts: ViewerOpts = {}): Promise<Post[]> {
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(visibleClause(opts.isAdmin === true))
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

export async function getPopularPosts(
  limit = 5,
  opts: ViewerOpts = {},
): Promise<PopularPost[]> {
  const rows = await getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      views: sql<number>`COALESCE(${schema.postViews.count}, 0)::int`,
    })
    .from(schema.posts)
    .leftJoin(schema.postViews, eq(schema.posts.slug, schema.postViews.slug))
    .where(visibleClause(opts.isAdmin === true))
    .orderBy(
      desc(sql`COALESCE(${schema.postViews.count}, 0)`),
      desc(schema.posts.publishAt),
    )
    .limit(limit);
  return rows;
}

export async function getPostBySlug(
  slug: string,
  opts: ViewerOpts = {},
): Promise<Post | null> {
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.slug, slug), visibleClause(opts.isAdmin === true)))
    .limit(1);
  return rows[0] ? toPost(rows[0]) : null;
}

export type AdjacentPost = {
  slug: string;
  title: string;
  cover: string | null;
  readingMinutes: number;
};

export async function getAdjacentPosts(
  slug: string,
  opts: ViewerOpts = {},
): Promise<{
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}> {
  const rows = await getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      cover: schema.posts.cover,
      content: schema.posts.content,
    })
    .from(schema.posts)
    .where(visibleClause(opts.isAdmin === true))
    .orderBy(desc(schema.posts.publishAt), desc(schema.posts.createdAt));
  const i = rows.findIndex((r) => r.slug === slug);
  if (i < 0) return { prev: null, next: null };
  const toAdjacent = (r: (typeof rows)[number]): AdjacentPost => ({
    slug: r.slug,
    title: r.title,
    cover: r.cover,
    readingMinutes: estimateReadingTime(r.content).minutes,
  });
  return {
    prev: i > 0 ? toAdjacent(rows[i - 1]) : null,
    next: i < rows.length - 1 ? toAdjacent(rows[i + 1]) : null,
  };
}

export async function getAllTags(
  opts: ViewerOpts = {},
): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts(opts);
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

export async function getPostsByTag(
  tag: string,
  opts: ViewerOpts = {},
): Promise<Post[]> {
  const posts = await getAllPosts(opts);
  return posts.filter((p) => p.frontmatter.tags.includes(tag));
}

export type SearchHit = Post & { score: number };

export async function searchPosts(
  query: string,
  opts: ViewerOpts & { tag?: string; year?: string } = {},
): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;

  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(
      and(
        visibleClause(opts.isAdmin === true),
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

  let hits = rows.map((row) => {
    const post = toPost(row);
    return { ...post, score: 0 };
  });

  if (opts.tag) {
    hits = hits.filter((h) => h.frontmatter.tags.includes(opts.tag!));
  }
  if (opts.year) {
    hits = hits.filter((h) => h.frontmatter.date.startsWith(opts.year!));
  }

  return hits;
}

export type SeriesSummary = {
  name: string;
  count: number;
  latestDate: string;
};

export async function getAllSeries(
  opts: ViewerOpts = {},
): Promise<SeriesSummary[]> {
  const posts = await getAllPosts(opts);
  const grouped = new Map<string, { count: number; latest: string }>();
  for (const p of posts) {
    const s = p.frontmatter.series;
    if (!s) continue;
    const entry = grouped.get(s);
    const date = p.frontmatter.date;
    if (entry) {
      entry.count += 1;
      if (date > entry.latest) entry.latest = date;
    } else {
      grouped.set(s, { count: 1, latest: date });
    }
  }
  return [...grouped.entries()]
    .map(([name, v]) => ({ name, count: v.count, latestDate: v.latest }))
    .sort((a, b) => (b.latestDate > a.latestDate ? 1 : -1));
}

export async function getPostsBySeries(
  name: string,
  opts: ViewerOpts = {},
): Promise<Post[]> {
  const all = await getAllPosts(opts);
  return all
    .filter((p) => p.frontmatter.series === name)
    .sort((a, b) => {
      const ao = a.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.frontmatter.date.localeCompare(b.frontmatter.date);
    });
}
