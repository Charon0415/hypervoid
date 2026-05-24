import Link from "next/link";
import { getDb, schema } from "@/db/client";
import { eq } from "drizzle-orm";

async function getAnnouncement(key: string): Promise<string> {
  try {
    const rows = await getDb()
      .select({ value: schema.siteOverrides.value })
      .from(schema.siteOverrides)
      .where(eq(schema.siteOverrides.key, key))
      .limit(1);
    return rows[0]?.value ?? "";
  } catch {
    return "";
  }
}

export async function AnnouncementWidget() {
  const message =
    (await getAnnouncement("announcementMessage")) ||
    process.env.ANNOUNCEMENT_MESSAGE ||
    "";
  if (!message) return null;

  const linkHref =
    (await getAnnouncement("announcementLink")) ||
    process.env.ANNOUNCEMENT_LINK ||
    "";
  const linkText =
    (await getAnnouncement("announcementLinkText")) ||
    process.env.ANNOUNCEMENT_LINK_TEXT ||
    "";

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
      <p className="text-xs uppercase tracking-wider text-muted">✦ 公告</p>
      <p className="mt-1.5 text-sm leading-relaxed">{message}</p>
      {linkHref ? (
        <Link
          href={linkHref}
          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
        >
          {linkText || "了解更多"} →
        </Link>
      ) : null}
    </div>
  );
}
