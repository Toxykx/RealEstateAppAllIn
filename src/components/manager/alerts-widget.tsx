import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { ManagerAlert } from "@/lib/alerts";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

export function AlertsWidget({ alerts }: { alerts: ManagerAlert[] }) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        message="אין התראות פתוחות"
        description="כל הנכסים והפעילות במשרד תקינים כרגע."
        compact
      />
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map((alert) => {
        const content = (
          <>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-foreground">{alert.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(alert.createdAt)}</p>
            </div>
          </>
        );

        return (
          <li key={alert.id}>
            {alert.propertyId ? (
              <Link
                href={`/agent/properties/${alert.propertyId}`}
                className="flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 p-3 text-sm hover:bg-primary/10"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 p-3 text-sm">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
