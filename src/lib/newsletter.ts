import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmailHtml(args: {
  title: string;
  description: string | null;
  url: string;
  unsubscribeUrl: string;
}): string {
  const desc = args.description
    ? `<p style="color:#52525b;font-size:15px;line-height:1.6">${escapeHtml(args.description)}</p>`
    : "";
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <p style="font-size:12px;color:#a1a1aa;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px">Hypervoid · 新文章</p>
  <h1 style="margin:0;line-height:1.3">${escapeHtml(args.title)}</h1>
  ${desc}
  <p style="margin:24px 0">
    <a href="${args.url}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">阅读全文 →</a>
  </p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0" />
  <p style="color:#a1a1aa;font-size:12px;margin:0">
    收到这封邮件是因为你订阅了 ${siteConfig.name}。<br/>
    不想再收：<a href="${args.unsubscribeUrl}" style="color:#a1a1aa">退订</a>
  </p>
</div>`;
}

export async function broadcastPost(slug: string): Promise<{
  sent: number;
  failed: number;
  errors: string[];
  alreadyNotified: boolean;
}> {
  const db = getDb();

  const postRows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.slug, slug))
    .limit(1);
  const post = postRows[0];
  if (!post) throw new Error("Post not found");
  if (post.status !== "published") {
    throw new Error("只能广播已发布的文章");
  }
  if (post.notifiedAt) {
    return { sent: 0, failed: 0, errors: [], alreadyNotified: true };
  }

  const subs = await db
    .select({
      email: schema.subscribers.email,
      unsubscribeToken: schema.subscribers.unsubscribeToken,
    })
    .from(schema.subscribers)
    .where(
      and(
        eq(schema.subscribers.verified, true),
        isNull(schema.subscribers.unsubscribedAt),
      ),
    );

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const postUrl = `${siteConfig.url}/posts/${slug}`;

  for (const sub of subs) {
    const unsubUrl = `${siteConfig.url}/api/unsubscribe?token=${sub.unsubscribeToken}`;
    const result = await sendEmail({
      to: sub.email,
      subject: `[Hypervoid] ${post.title}`,
      text: `${post.title}\n\n${post.description ?? ""}\n\n阅读全文：${postUrl}\n\n退订：${unsubUrl}`,
      html: renderEmailHtml({
        title: post.title,
        description: post.description,
        url: postUrl,
        unsubscribeUrl: unsubUrl,
      }),
    });
    if ("error" in result) {
      failed++;
      errors.push(`${sub.email}: ${result.error}`);
    } else {
      sent++;
    }
  }

  await db
    .update(schema.posts)
    .set({ notifiedAt: new Date() })
    .where(eq(schema.posts.slug, slug));

  return { sent, failed, errors, alreadyNotified: false };
}

export async function countActiveSubscribers(): Promise<number> {
  const rows = await getDb()
    .select({ id: schema.subscribers.id })
    .from(schema.subscribers)
    .where(
      and(
        eq(schema.subscribers.verified, true),
        isNull(schema.subscribers.unsubscribedAt),
      ),
    );
  return rows.length;
}
