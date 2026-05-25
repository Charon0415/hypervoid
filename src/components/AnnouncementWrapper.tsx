import { AnnouncementBar } from "@/components/AnnouncementBar";
import { getDb, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { getActiveAnnouncement } from "@/db/announcements";

async function getAnnouncementOverride(key: string): Promise<string> {
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

export async function AnnouncementWrapper() {
  // 1) New: announcements table at slot=top (highest priority)
  const top = await getActiveAnnouncement("top").catch(() => null);
  if (top) {
    return (
      <AnnouncementBar
        id={`slot-${top.id}`}
        message={top.message}
        linkHref={top.link ?? undefined}
        linkText={top.linkText ?? undefined}
      />
    );
  }

  // 2) Legacy: site_overrides keys
  const message =
    (await getAnnouncementOverride("announcementMessage")) ||
    process.env.ANNOUNCEMENT_MESSAGE ||
    "";
  if (!message) return null;

  const linkHref =
    (await getAnnouncementOverride("announcementLink")) ||
    process.env.ANNOUNCEMENT_LINK ||
    "";
  const linkText =
    (await getAnnouncementOverride("announcementLinkText")) ||
    process.env.ANNOUNCEMENT_LINK_TEXT ||
    "";

  return (
    <AnnouncementBar
      id="sitewide"
      message={message}
      linkHref={linkHref || undefined}
      linkText={linkText || undefined}
    />
  );
}
