import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type Subscriber = typeof schema.subscribers.$inferSelect;

export type SubscriberStats = {
  total: number;
  verified: number;
  pending: number;
  unsubscribed: number;
};

export async function listAllSubscribers(): Promise<Subscriber[]> {
  return getDb()
    .select()
    .from(schema.subscribers)
    .orderBy(desc(schema.subscribers.createdAt));
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const db = getDb();
  const [all, verified, pending, unsubscribed] = await Promise.all([
    db.select({ id: schema.subscribers.id }).from(schema.subscribers),
    db
      .select({ id: schema.subscribers.id })
      .from(schema.subscribers)
      .where(
        and(
          eq(schema.subscribers.verified, true),
          isNull(schema.subscribers.unsubscribedAt),
        ),
      ),
    db
      .select({ id: schema.subscribers.id })
      .from(schema.subscribers)
      .where(eq(schema.subscribers.verified, false)),
    db
      .select({ id: schema.subscribers.id })
      .from(schema.subscribers)
      .where(isNotNull(schema.subscribers.unsubscribedAt)),
  ]);
  return {
    total: all.length,
    verified: verified.length,
    pending: pending.length,
    unsubscribed: unsubscribed.length,
  };
}

export async function deleteSubscriber(id: string): Promise<void> {
  await getDb()
    .delete(schema.subscribers)
    .where(eq(schema.subscribers.id, id));
}

export async function forceUnsubscribe(id: string): Promise<void> {
  await getDb()
    .update(schema.subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(schema.subscribers.id, id));
}

export async function restoreSubscriber(id: string): Promise<void> {
  await getDb()
    .update(schema.subscribers)
    .set({ unsubscribedAt: null })
    .where(eq(schema.subscribers.id, id));
}
