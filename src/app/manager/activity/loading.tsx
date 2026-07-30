import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TimelineSkeleton } from "@/components/ui/skeletons/timeline-skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <TimelineSkeleton items={8} />
        </CardContent>
      </Card>
    </div>
  );
}
