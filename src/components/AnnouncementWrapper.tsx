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
  const message = await getAnnouncementOverride("announcementMessage");
  if (!message) return null;

  const linkHref = await getAnnouncementOverride("announcementLink");
  const linkText = await getAnnouncementOverride("announcementLinkText");

  return (
    <AnnouncementBar
      id="sitewide"
      message={message}
      linkHref={linkHref || undefined}
      linkText={linkText || undefined}
    />
  );
}
