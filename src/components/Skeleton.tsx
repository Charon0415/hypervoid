export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-border/50 ${className ?? ""}`}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
      <Skeleton className="aspect-[4/3] w-full sm:h-24 sm:w-32 sm:aspect-auto" />
      <div className="flex flex-1 flex-col gap-2.5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Skeleton className="h-8 w-3/5" />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ rows }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows ?? 4 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
