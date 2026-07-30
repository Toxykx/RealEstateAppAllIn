import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function ClientsListLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <TableSkeleton rows={7} columns={5} />
    </div>
  );
}
