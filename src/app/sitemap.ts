import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1.0 },
  { path: "/posts", priority: 0.9 },
  { path: "/tags", priority: 0.8 },
  { path: "/about", priority: 0.8 },
  { path: "/projects", priority: 0.7 },
  { path: "/skills", priority: 0.6 },
  { path: "/anime", priority: 0.6 },
  { path: "/timeline", priority: 0.6 },
  { path: "/albums", priority: 0.5 },
  { path: "/diary", priority: 0.5 },
  { path: "/friends", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority,
    }),
  );

  const postUrls: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/posts/${post.slug}`,
    lastModified: post.frontmatter.date
      ? new Date(post.frontmatter.date)
      : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tagUrls: MetadataRoute.Sitemap = getAllTags().map(({ tag }) => ({
    url: `${siteConfig.url}/tags/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticUrls, ...postUrls, ...tagUrls];
}
