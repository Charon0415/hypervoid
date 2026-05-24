import { ListSkeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-border/50" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-border/50" />
      </div>
      <ListSkeleton rows={3} />
    </div>
  );
}
