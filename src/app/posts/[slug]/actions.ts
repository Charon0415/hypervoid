"use server";

import { revalidatePath } from "next/cache";
import { incrementViewCount } from "@/db/posts-stats";
import { decrementReaction, incrementReaction } from "@/lib/reactions";

export async function recordView(slug: string): Promise<number | null> {
  return incrementViewCount(slug);
}

export async function recordReaction(
  slug: string,
  emoji: string,
): Promise<number | null> {
  const count = await incrementReaction(slug, emoji);
  if (count !== null) {
    revalidatePath(`/posts/${slug}`);
  }
  return count;
}

export async function unrecordReaction(
  slug: string,
  emoji: string,
): Promise<number | null> {
  const count = await decrementReaction(slug, emoji);
  if (count !== null) {
    revalidatePath(`/posts/${slug}`);
  }
  return count;
}
