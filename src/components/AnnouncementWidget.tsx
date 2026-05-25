import Link from "next/link";
import { inArray } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getActiveAnnouncement } from "@/db/announcements";

const LEGACY_KEYS = [
  "announcementMessage",
  "announcementLink",
  "announcementLinkText",
] as const;

async function getLegacyOverrides(): Promise<Record<string, string>> {
  try {
    const rows = await getDb()
      .select({
        key: schema.siteOverrides.key,
        value: schema.siteOverrides.value,
      })
      .from(schema.siteOverrides)
      .where(inArray(schema.siteOverrides.key, [...LEGACY_KEYS]));
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export async function AnnouncementWidget() {
  // Multi-slot + legacy keys fetched in parallel — previously these were
  // 4 sequential Neon HTTP round-trips on every home-page render.
  const [slotEntry, legacy] = await Promise.all([
    getActiveAnnouncement("sidebar").catch(() => null),
    getLegacyOverrides(),
  ]);

  // 1) Multi-slot: prefer DB-managed sidebar slot
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
    legacy.announcementMessage || process.env.ANNOUNCEMENT_MESSAGE || "";
  if (!message) return null;

  const linkHref =
    legacy.announcementLink || process.env.ANNOUNCEMENT_LINK || "";
  const linkText =
    legacy.announcementLinkText || process.env.ANNOUNCEMENT_LINK_TEXT || "";

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
