import Link from "next/link";
import { ArrowRight, RadioTower } from "lucide-react";
import { getActiveAnnouncement } from "@/db/announcements";

/**
 * Slot-aware announcement banner mounted at the top of each article. Hidden
 * when no active announcement exists for slot=article_top.
 */
export async function ArticleTopAnnouncement() {
  const ann = await getActiveAnnouncement("article_top").catch(() => null);
  if (!ann) return null;

  return (
    <aside className="hv-panel mt-4 p-3 text-sm">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-cyan-50/72">
        <RadioTower className="h-4 w-4 text-cyan-100/70" aria-hidden />
        {ann.message}
        {ann.link ? (
          <Link
            href={ann.link}
            className="inline-flex items-center gap-1 font-medium text-cyan-100 underline-offset-2 hover:underline"
          >
            {ann.linkText || "了解更多"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </p>
    </aside>
  );
}
