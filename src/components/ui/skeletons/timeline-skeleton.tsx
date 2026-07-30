import { Skeleton } from "@/components/ui/skeleton";

export function TimelineSkeleton({ items = 4 }: { items?: number }) {
  return (
    <ul className="space-y-0">
      {Array.from({ length: items }).map((_, i) => {
        const last = i === items - 1;
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              {!last && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 flex-1 space-y-2 pb-5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
