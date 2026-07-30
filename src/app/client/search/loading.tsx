import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCardSkeletonGrid } from "@/components/ui/skeletons/property-card-skeleton";

export default function ClientSearchLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-24 w-full" />
      <PropertyCardSkeletonGrid count={6} />
    </div>
  );
}
