import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCardSkeletonGrid } from "@/components/ui/skeletons/property-card-skeleton";

export default function ClientHomeLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertyCardSkeletonGrid count={2} />
        </div>
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
