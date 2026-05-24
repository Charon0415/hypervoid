import { AnnouncementBar } from "@/components/AnnouncementBar";
import { getDb, schema } from "@/db/client";
import { eq } from "drizzle-orm";

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
  // DB overrides take priority; fall back to env vars for quick setup.
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
