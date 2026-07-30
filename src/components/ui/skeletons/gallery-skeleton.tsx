import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Skeleton className="col-span-full aspect-video sm:col-span-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}
