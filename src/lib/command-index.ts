import "server-only";

import { unstable_cache } from "next/cache";
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts";

export type CommandIndexItem = {
  type: "post" | "tag" | "series";
  title: string;
  href: string;
  hint?: string;
};

/**
 * Build a flat index for the client-side command palette. Public posts only;
 * admins searching from the palette can still go to /search for the rest.
 *
 * Cached for 10 minutes — the palette is the only consumer and it's a
 * nice-to-have, so brief staleness is acceptable. Invalidated on post
 * create/update/delete via revalidateTag("posts").
 */
export const buildCommandIndex = unstable_cache(
  async (): Promise<CommandIndexItem[]> => {
    const [posts, tags, series] = await Promise.all([
      getAllPosts(),
      getAllTags(),
      getAllSeries(),
    ]);

    return [
      ...posts.map((p) => ({
        type: "post" as const,
        title: p.frontmatter.title,
        href: `/posts/${p.slug}`,
        hint: p.frontmatter.date,
      })),
      ...tags.map((t) => ({
        type: "tag" as const,
        title: `#${t.tag}`,
        href: `/tags/${encodeURIComponent(t.tag)}`,
        hint: `${t.count} 篇`,
      })),
      ...series.map((s) => ({
        type: "series" as const,
        title: s.name,
        href: `/series/${encodeURIComponent(s.name)}`,
        hint: `${s.count} 篇 · ${s.latestDate}`,
      })),
    ];
  },
  ["command-index"],
  { revalidate: 600, tags: ["posts"] },
);
