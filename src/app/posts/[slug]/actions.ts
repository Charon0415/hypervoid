"use server";

import { revalidatePath } from "next/cache";
import {
  decrementLikeCount,
  incrementLikeCount,
  incrementViewCount,
} from "@/db/posts-stats";

export async function recordView(slug: string): Promise<number | null> {
  return incrementViewCount(slug);
}

export async function recordLike(slug: string): Promise<number | null> {
  const count = await incrementLikeCount(slug);
  if (count !== null) {
    revalidatePath(`/posts/${slug}`);
  }
  return count;
}

export async function unrecordLike(slug: string): Promise<number | null> {
  const count = await decrementLikeCount(slug);
  if (count !== null) {
    revalidatePath(`/posts/${slug}`);
  }
  return count;
}
