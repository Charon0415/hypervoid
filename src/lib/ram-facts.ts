import "server-only";

import { desc, eq, and } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getSiteStats } from "@/lib/stats";

/** Compact, plain-text site factsheet for Ram's system prompt. */
export async function getRamSiteFacts(): Promise<string> {
  try {
    const stats = await getSiteStats();
    const latest = await getDb()
      .select({
        slug: schema.posts.slug,
        title: schema.posts.title,
        publishAt: schema.posts.publishAt,
      })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.status, "published"),
          eq(schema.posts.visibility, "public"),
        ),
      )
      .orderBy(desc(schema.posts.publishAt))
      .limit(1);

    const nowCN = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const lines = [
      `现在时间: ${nowCN} (东八区)`,
      `网站已经运行 ${stats.daysOnline} 天`,
      `主人已经发了 ${stats.posts} 篇公开文章`,
      `累计被读了 ${stats.views.toLocaleString("en-US")} 次`,
      `累计被点了 ${stats.likes.toLocaleString("en-US")} 次反应`,
    ];
    if (latest[0]?.title) {
      lines.push(`最新一篇文章是《${latest[0].title}》(slug: ${latest[0].slug})`);
    }
    return lines.join("\n");
  } catch {
    return "(数据看不清。大概是主人在折腾什么)";
  }
}
