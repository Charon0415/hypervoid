import { ListSkeleton } from "@/components/Skeleton";

export default function PostsLoading() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-40 animate-pulse rounded-lg bg-border/50" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-border/50" />
      </div>
      <ListSkeleton rows={5} />
    </div>
  );
}
