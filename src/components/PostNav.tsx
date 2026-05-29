import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2"
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
      className={`hv-panel hv-panel-hover group flex gap-3 p-3 sm:p-4 ${
        isPrev ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {post.cover ? (
        <Image
          src={post.cover}
          alt=""
          width={160}
          height={160}
          sizes="(min-width: 640px) 80px, 64px"
          loading="lazy"
          className="aspect-square h-16 w-16 shrink-0 border border-cyan-100/14 object-cover opacity-[0.86] saturate-[0.85] transition group-hover:opacity-100 group-hover:saturate-100 sm:h-20 sm:w-20"
        />
      ) : (
        <div
          aria-hidden
          className={`grid h-16 w-16 shrink-0 place-items-center border border-cyan-100/14 bg-cyan-50/[0.035] text-cyan-100/62 transition group-hover:border-cyan-100/32 sm:h-20 sm:w-20 ${
            isPrev
              ? "bg-[radial-gradient(circle_at_35%_50%,rgba(103,232,249,.16),transparent_48%)]"
              : "bg-[radial-gradient(circle_at_65%_50%,rgba(103,232,249,.16),transparent_48%)]"
          }`}
        >
          {isPrev ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </div>
      )}
      <div
        className={`flex min-w-0 flex-1 flex-col gap-1.5 ${
          isPrev ? "items-start text-left" : "items-end text-right"
        }`}
      >
        <span className="hv-kicker inline-flex items-center gap-1">
          {isPrev ? (
            <>
              <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden />
              上一篇
            </>
          ) : (
            <>
              下一篇
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </>
          )}
        </span>
        <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-cyan-50 transition group-hover:text-cyan-100 sm:text-base">
          {post.title}
        </p>
        <span className="font-mono text-[10px] uppercase text-cyan-50/48">
          {post.readingMinutes} min
        </span>
      </div>
    </Link>
  );
}
