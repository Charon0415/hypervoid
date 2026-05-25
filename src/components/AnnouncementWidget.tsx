import Link from "next/link";
import { getDb, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { getActiveAnnouncement } from "@/db/announcements";

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
  // 1) Multi-slot: prefer DB-managed sidebar slot
  const slotEntry = await getActiveAnnouncement("sidebar").catch(() => null);
  if (slotEntry) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted">✦ 公告</p>
        <p className="mt-1.5 text-sm leading-relaxed">{slotEntry.message}</p>
        {slotEntry.link ? (
          <Link
            href={slotEntry.link}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:-translate-y-0.5"
          >
            {slotEntry.linkText || "了解更多"} →
          </Link>
        ) : null}
      </div>
    );
  }

  // 2) Legacy override / env fallback
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
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">✦ 公告</p>
      <p className="mt-1.5 text-sm leading-relaxed">{message}</p>
      {linkHref ? (
        <Link
          href={linkHref}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:-translate-y-0.5"
        >
          {linkText || "了解更多"} →
        </Link>
      ) : null}
    </div>
  );
}
