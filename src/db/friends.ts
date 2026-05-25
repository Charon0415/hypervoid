import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type Friend = typeof schema.friends.$inferSelect;
export type FriendInput = {
  name: string;
  url: string;
  avatar?: string | null;
  description?: string | null;
  email?: string | null;
  sortOrder?: number;
};

export async function listFriends(status: string = "approved"): Promise<Friend[]> {
  return getDb()
    .select()
    .from(schema.friends)
    .where(eq(schema.friends.status, status))
    .orderBy(asc(schema.friends.sortOrder), asc(schema.friends.createdAt));
}

export async function listPendingApplications(): Promise<Friend[]> {
  return listFriends("pending");
}

export async function getFriend(id: string): Promise<Friend | null> {
  const rows = await getDb()
    .select()
    .from(schema.friends)
    .where(eq(schema.friends.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createFriend(input: FriendInput, status: string = "approved"): Promise<Friend> {
  const rows = await getDb()
    .insert(schema.friends)
    .values({
      name: input.name,
      url: input.url,
      avatar: input.avatar ?? null,
      description: input.description ?? null,
      email: input.email ?? null,
      status,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return rows[0];
}

export async function updateFriend(
  id: string,
  input: FriendInput,
): Promise<void> {
  await getDb()
    .update(schema.friends)
    .set({
      name: input.name,
      url: input.url,
      avatar: input.avatar ?? null,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.friends.id, id));
}

export async function approveApplication(id: string): Promise<void> {
  await getDb()
    .update(schema.friends)
    .set({ status: "approved", updatedAt: new Date() })
    .where(and(eq(schema.friends.id, id), eq(schema.friends.status, "pending")));
}

export async function rejectApplication(id: string): Promise<void> {
  await getDb()
    .update(schema.friends)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(and(eq(schema.friends.id, id), eq(schema.friends.status, "pending")));
}

export async function deleteFriend(id: string): Promise<void> {
  await getDb().delete(schema.friends).where(eq(schema.friends.id, id));
}
