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
      <div className="hv-panel-sci group relative overflow-hidden p-5">
        {/* Alert indicator */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-cyan-400/60 to-transparent" />

        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center">
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-cyan-400/60" />
            <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-400">Notice</p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-cyan-50/80">{slotEntry.message}</p>
        {slotEntry.link ? (
          <a
            href={slotEntry.link}
            className="mt-3 inline-flex items-center gap-1.5 border-b border-cyan-400/30 pb-0.5 font-mono text-xs font-medium text-cyan-400 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {slotEntry.linkText || "了解更多"}
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
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
    <div className="hv-panel-sci group relative overflow-hidden p-5">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-cyan-400/60 to-transparent" />

      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center">
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-cyan-400/60" />
          <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
        </span>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-400">Notice</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-cyan-50/80">{message}</p>
      {linkHref ? (
        <a
          href={linkHref}
          className="mt-3 inline-flex items-center gap-1.5 border-b border-cyan-400/30 pb-0.5 font-mono text-xs font-medium text-cyan-400 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          {linkText || "了解更多"}
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
