import "server-only";

import { and, desc, eq, isNull, lte, gte, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type AnnouncementSlot = "top" | "sidebar" | "article_top";

export type Announcement = typeof schema.announcements.$inferSelect;

export async function listAllAnnouncements(): Promise<Announcement[]> {
  return getDb()
    .select()
    .from(schema.announcements)
    .orderBy(desc(schema.announcements.priority), desc(schema.announcements.updatedAt));
}

/**
 * Return the highest-priority active announcement for the given slot, if any
 * time-window is satisfied. Slots are independent; the call site decides
 * which slot to render.
 */
export async function getActiveAnnouncement(
  slot: AnnouncementSlot,
): Promise<Announcement | null> {
  const now = new Date();
  const rows = await getDb()
    .select()
    .from(schema.announcements)
    .where(
      and(
        eq(schema.announcements.slot, slot),
        eq(schema.announcements.active, true),
        or(
          isNull(schema.announcements.startsAt),
          lte(schema.announcements.startsAt, now),
        ),
        or(
          isNull(schema.announcements.endsAt),
          gte(schema.announcements.endsAt, now),
        ),
      ),
    )
    .orderBy(desc(schema.announcements.priority), desc(schema.announcements.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}

export type AnnouncementInput = {
  slot: AnnouncementSlot;
  message: string;
  link?: string | null;
  linkText?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  priority: number;
  active: boolean;
};

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<void> {
  await getDb()
    .insert(schema.announcements)
    .values({
      slot: input.slot,
      message: input.message,
      link: input.link ?? null,
      linkText: input.linkText ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      priority: input.priority,
      active: input.active,
    });
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<void> {
  await getDb()
    .update(schema.announcements)
    .set({
      slot: input.slot,
      message: input.message,
      link: input.link ?? null,
      linkText: input.linkText ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      priority: input.priority,
      active: input.active,
      updatedAt: sql`NOW()`,
    })
    .where(eq(schema.announcements.id, id));
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await getDb()
    .delete(schema.announcements)
    .where(eq(schema.announcements.id, id));
}

export async function toggleAnnouncement(id: string): Promise<void> {
  await getDb()
    .update(schema.announcements)
    .set({
      active: sql`NOT ${schema.announcements.active}`,
      updatedAt: sql`NOW()`,
    })
    .where(eq(schema.announcements.id, id));
}
