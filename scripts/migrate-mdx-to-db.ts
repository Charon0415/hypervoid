import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import * as schema from "../src/db/schema";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = neon(url);
  const db = drizzle({ client: sql, schema });

  if (!fs.existsSync(POSTS_DIR)) {
    console.log(`No content dir ${POSTS_DIR}, nothing to migrate.`);
    return;
  }

  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
  let migrated = 0;
  let skipped = 0;

  for (const entry of entries) {
    let slug: string;
    let filepath: string;
    if (entry.isFile() && /\.(mdx|md)$/.test(entry.name)) {
      slug = entry.name.replace(/\.(mdx|md)$/, "");
      filepath = path.join(POSTS_DIR, entry.name);
    } else if (entry.isDirectory()) {
      const idx = ["index.mdx", "index.md"].find((f) =>
        fs.existsSync(path.join(POSTS_DIR, entry.name, f)),
      );
      if (!idx) continue;
      slug = entry.name;
      filepath = path.join(POSTS_DIR, entry.name, idx);
    } else {
      continue;
    }

    const raw = fs.readFileSync(filepath, "utf8");
    const { data, content } = matter(raw);

    const existing = await db
      .select({ slug: schema.posts.slug })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);
    if (existing.length) {
      console.log(`[skip] ${slug} (already in DB)`);
      skipped++;
      continue;
    }

    const date =
      data.date instanceof Date
        ? data.date
        : typeof data.date === "string"
          ? new Date(data.date)
          : new Date();
    const draft = Boolean(data.draft);

    await db.insert(schema.posts).values({
      slug,
      title: String(data.title ?? "Untitled"),
      description:
        typeof data.description === "string" ? data.description : null,
      content,
      category:
        typeof data.category === "string" ? data.category : null,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      cover: typeof data.cover === "string" ? data.cover : null,
      status: draft ? "draft" : "published",
      publishAt: date,
      createdAt: date,
      updatedAt: date,
    });

    console.log(`[ok]   ${slug}`);
    migrated++;
  }

  console.log(`\nMigrated ${migrated}, skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
