import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function ManagerAgentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
      <TableSkeleton rows={7} columns={6} />
    </div>
  );
}
