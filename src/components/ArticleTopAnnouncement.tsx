import Link from "next/link";
import { getActiveAnnouncement } from "@/db/announcements";

/**
 * Slot-aware announcement banner mounted at the top of each article. Hidden
 * when no active announcement exists for slot=article_top.
 */
export async function ArticleTopAnnouncement() {
  const ann = await getActiveAnnouncement("article_top").catch(() => null);
  if (!ann) return null;

  return (
    <aside className="mt-4 rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm">
      <p>
        <span className="mr-2 text-primary">✦</span>
        {ann.message}
        {ann.link ? (
          <Link
            href={ann.link}
            className="ml-2 inline-flex items-center gap-0.5 font-medium text-primary underline-offset-2 hover:underline"
          >
            {ann.linkText || "了解更多"} →
          </Link>
        ) : null}
      </p>
    </aside>
  );
}
