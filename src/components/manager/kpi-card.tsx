import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="mt-1 font-heading text-2xl text-primary">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  );
}
