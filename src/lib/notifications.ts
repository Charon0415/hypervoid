import "server-only";

import { and, desc, eq, gt, isNotNull, isNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getActiveAnnouncement } from "@/db/announcements";
import type { Notification } from "@/lib/notifications-shared";

export type { Notification } from "@/lib/notifications-shared";

/**
 * Visitor view — public-safe surface: latest active announcements + recently
 * published / updated posts. No personal data.
 */
export async function getVisitorNotifications(): Promise<Notification[]> {
  const out: Notification[] = [];

  // 1. Up to 3 active announcements (any slot)
  try {
    const [top, side, art] = await Promise.all([
      getActiveAnnouncement("top"),
      getActiveAnnouncement("sidebar"),
      getActiveAnnouncement("article_top"),
    ]);
    for (const a of [top, side, art].filter(Boolean)) {
      out.push({
        id: `announcement-${a!.id}`,
        type: "announcement",
        title: a!.message,
        href: a!.link ?? undefined,
        at: a!.updatedAt.toISOString(),
      });
    }
  } catch {
    /* db unavailable */
  }

  // 2. Latest 5 published posts
  try {
    const rows = await getDb()
      .select({
        slug: schema.posts.slug,
        title: schema.posts.title,
        description: schema.posts.description,
        publishAt: schema.posts.publishAt,
        createdAt: schema.posts.createdAt,
      })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.visibility, "public"),
          or(
            eq(schema.posts.status, "published"),
            and(
              eq(schema.posts.status, "scheduled"),
              sql`${schema.posts.publishAt} <= NOW()`,
            ),
          ),
        ),
      )
      .orderBy(
        desc(schema.posts.publishAt),
        desc(schema.posts.createdAt),
      )
      .limit(5);
    for (const r of rows) {
      const at = (r.publishAt ?? r.createdAt).toISOString();
      out.push({
        id: `post-${r.slug}`,
        type: "new-post",
        title: r.title,
        body: r.description ?? undefined,
        href: `/posts/${r.slug}`,
        at,
      });
    }
  } catch {
    /* db unavailable */
  }

  return out
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12);
}

/**
 * Admin view — everything the visitor sees PLUS interaction signals: recent
 * guestbook messages, new subscribers, top liked/viewed posts.
 */
export async function getAdminNotifications(): Promise<Notification[]> {
  const out: Notification[] = await getVisitorNotifications();

  // Recent guestbook messages (last 10)
  try {
    const rows = await getDb()
      .select()
      .from(schema.guestbookMessages)
      .orderBy(desc(schema.guestbookMessages.createdAt))
      .limit(10);
    for (const m of rows) {
      out.push({
        id: `gb-${m.id}`,
        type: "guestbook",
        title: `留言 · @${m.githubLogin}`,
        body: m.message.slice(0, 120) + (m.message.length > 120 ? "…" : ""),
        href: "/admin/guestbook",
        at: m.createdAt.toISOString(),
      });
    }
  } catch {
    /* db unavailable */
  }

  // New subscribers (verified + un-unsubscribed, last 10)
  try {
    const rows = await getDb()
      .select({
        id: schema.subscribers.id,
        email: schema.subscribers.email,
        verifiedAt: schema.subscribers.verifiedAt,
      })
      .from(schema.subscribers)
      .where(
        and(
          eq(schema.subscribers.verified, true),
          isNull(schema.subscribers.unsubscribedAt),
          isNotNull(schema.subscribers.verifiedAt),
        ),
      )
      .orderBy(desc(schema.subscribers.verifiedAt))
      .limit(10);
    for (const s of rows) {
      const at = (s.verifiedAt ?? new Date()).toISOString();
      out.push({
        id: `sub-${s.id}`,
        type: "subscriber",
        title: `新订阅 · ${s.email}`,
        href: "/admin/subscribers",
        at,
      });
    }
  } catch {
    /* db unavailable */
  }

  // Top liked posts (snapshot)
  try {
    const rows = await getDb()
      .select({
        slug: schema.postLikes.slug,
        count: schema.postLikes.count,
        title: schema.posts.title,
        updatedAt: schema.postLikes.updatedAt,
      })
      .from(schema.postLikes)
      .leftJoin(schema.posts, eq(schema.posts.slug, schema.postLikes.slug))
      .where(gt(schema.postLikes.count, 0))
      .orderBy(desc(schema.postLikes.count))
      .limit(5);
    for (const r of rows) {
      out.push({
        id: `like-${r.slug}`,
        type: "like",
        title: `${r.title ?? r.slug}`,
        metric: `♥ ${r.count}`,
        href: `/posts/${r.slug}`,
        at: r.updatedAt.toISOString(),
      });
    }
  } catch {
    /* db unavailable */
  }

  return out
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 30);
}
