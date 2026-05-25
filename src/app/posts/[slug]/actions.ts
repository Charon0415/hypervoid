"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { incrementViewCount } from "@/db/posts-stats";
import { decrementReaction, incrementReaction } from "@/lib/reactions";
import { rateLimit } from "@/lib/rate-limit";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function reactionGuard(slug: string): Promise<void> {
  // Reactions are anonymous, so the cap is per-IP. 60 reaction clicks per
  // 10 minutes is generous enough for genuine browsing (toggling emojis,
  // multi-tab) but caps drive-by spam.
  const ip = await clientIp();
  const rl = await rateLimit(`${ip}:${slug}`, {
    key: "react",
    limit: 60,
    windowSec: 10 * 60,
  });
  if (!rl.ok) throw new Error("点得太快了,稍后再试。");
}

export async function recordView(slug: string): Promise<number | null> {
  return incrementViewCount(slug);
}

export async function recordReaction(
  slug: string,
  emoji: string,
): Promise<number | null> {
  await reactionGuard(slug);
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
  await reactionGuard(slug);
  const count = await decrementReaction(slug, emoji);
  if (count !== null) {
    revalidatePath(`/posts/${slug}`);
  }
  return count;
}
