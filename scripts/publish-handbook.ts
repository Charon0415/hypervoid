import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import * as schema from "../src/db/schema";

const SLUG = "hypervoid-handbook";
const TITLE = "Hypervoid 完全指南";
const DESCRIPTION =
  "从架构、本地开发到部署运维、故障排查、扩展开发的厚手册——这套博客系统从零到上线的完整工具书。";
const CATEGORY = "技术";
const TAGS = ["Next.js", "指南", "Hypervoid", "运维"];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const handbookPath = path.join(process.cwd(), "docs/handbook.md");
  if (!fs.existsSync(handbookPath)) {
    throw new Error(`Missing ${handbookPath}`);
  }
  const raw = fs.readFileSync(handbookPath, "utf8");

  // Strip the document-level H1 + lead block (first "## 目录" is where article body starts);
  // we keep the lead paragraph as MDX intro.
  const content = raw;

  const sql = neon(url);
  const db = drizzle({ client: sql, schema });

  const existing = await db
    .select({ slug: schema.posts.slug })
    .from(schema.posts)
    .where(eq(schema.posts.slug, SLUG))
    .limit(1);

  const now = new Date();

  if (existing.length) {
    await db
      .update(schema.posts)
      .set({
        title: TITLE,
        description: DESCRIPTION,
        content,
        category: CATEGORY,
        tags: TAGS,
        status: "published",
        publishAt: now,
        updatedAt: now,
      })
      .where(eq(schema.posts.slug, SLUG));
    console.log(`[update] ${SLUG}`);
  } else {
    await db.insert(schema.posts).values({
      slug: SLUG,
      title: TITLE,
      description: DESCRIPTION,
      content,
      category: CATEGORY,
      tags: TAGS,
      status: "published",
      publishAt: now,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`[insert] ${SLUG}`);
  }

  console.log(`\nDone. Available at /posts/${SLUG}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
