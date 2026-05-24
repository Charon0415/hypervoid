import { ListSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-border/50" />
      </div>
      <div className="mb-8">
        <div className="h-10 w-full animate-pulse rounded-full bg-border/50" />
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}
