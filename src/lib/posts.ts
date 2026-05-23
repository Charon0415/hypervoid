import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  category?: string;
  cover?: string;
  draft?: boolean;
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

function readPostFile(slug: string): Post | null {
  const candidates = [
    path.join(POSTS_DIR, `${slug}.mdx`),
    path.join(POSTS_DIR, `${slug}.md`),
    path.join(POSTS_DIR, slug, "index.mdx"),
    path.join(POSTS_DIR, slug, "index.md"),
  ];
  const filepath = candidates.find((p) => fs.existsSync(p));
  if (!filepath) return null;

  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = normalizeFrontmatter(data);
  return { slug, frontmatter, content };
}

function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  const rawDate = data.date;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : typeof rawDate === "string"
        ? rawDate
        : "";
  return {
    title: String(data.title ?? "Untitled"),
    description:
      typeof data.description === "string" ? data.description : undefined,
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    category:
      typeof data.category === "string" ? data.category : undefined,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    draft: Boolean(data.draft),
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
  const slugs: string[] = [];
  for (const entry of entries) {
    if (entry.isFile() && /\.(mdx|md)$/.test(entry.name)) {
      slugs.push(entry.name.replace(/\.(mdx|md)$/, ""));
    } else if (entry.isDirectory()) {
      const idx = ["index.mdx", "index.md"].find((f) =>
        fs.existsSync(path.join(POSTS_DIR, entry.name, f)),
      );
      if (idx) slugs.push(entry.name);
    }
  }
  return slugs;
}

export function getAllPosts(): Post[] {
  return getAllPostSlugs()
    .map((slug) => readPostFile(slug))
    .filter((p): p is Post => !!p)
    .filter((p) => !p.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return readPostFile(slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.frontmatter.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
