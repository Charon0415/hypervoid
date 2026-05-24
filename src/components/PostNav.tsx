import Link from "next/link";
import type { AdjacentPost } from "@/lib/posts";

export function PostNav({
  prev,
  next,
}: {
  prev: AdjacentPost | null;
  next: AdjacentPost | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="文章导航"
      className="mt-12 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <NavCard side="prev" post={prev} />
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}
      {next ? (
        <NavCard side="next" post={next} />
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}
    </nav>
  );
}

function NavCard({
  side,
  post,
}: {
  side: "prev" | "next";
  post: AdjacentPost;
}) {
  const isPrev = side === "prev";
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm sm:p-5 ${
        isPrev ? "items-start text-left" : "items-end text-right"
      }`}
    >
      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted transition group-hover:text-primary">
        {isPrev ? (
          <>
            <ArrowIcon dir="left" />
            上一篇
          </>
        ) : (
          <>
            下一篇
            <ArrowIcon dir="right" />
          </>
        )}
      </span>
      <p className="line-clamp-2 font-medium tracking-tight transition group-hover:text-primary">
        {post.title}
      </p>
    </Link>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      className={`h-3.5 w-3.5 transition ${
        dir === "left"
          ? "group-hover:-translate-x-0.5"
          : "group-hover:translate-x-0.5"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </>
      )}
    </svg>
  );
}
