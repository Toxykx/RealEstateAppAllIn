import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {[40, 65, 45, 80, 55, 70, 35].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-sm rounded-b-none" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
