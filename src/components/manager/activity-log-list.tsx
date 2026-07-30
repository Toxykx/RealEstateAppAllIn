import { Activity } from "lucide-react";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "@/lib/activity-log";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import type { ActivityType } from "@prisma/client";

export type ActivityLogEntry = {
  id: string;
  activityType: ActivityType;
  description: string;
  createdAt: Date;
  agent?: { name: string } | null;
  property?: { title: string } | null;
};

export function ActivityLogList({
  logs,
  showProperty = false,
}: {
  logs: ActivityLogEntry[];
  showProperty?: boolean;
}) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        message="עדיין אין פעילות רשומה"
        description="פעולות כמו עדכוני סטטוס, ביקורים ומסמכים יופיעו כאן."
        compact
      />
    );
  }

  return (
    <ul className="space-y-0">
      {logs.map((log, i) => {
        const Icon = ACTIVITY_TYPE_ICONS[log.activityType];
        const last = i === logs.length - 1;
        return (
          <li key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {!last && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 flex-1 pb-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                <span className="font-medium text-foreground">{ACTIVITY_TYPE_LABELS[log.activityType]}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
              </div>
              {(showProperty && log.property) || log.agent ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {showProperty && log.property ? log.property.title : ""}
                  {showProperty && log.property && log.agent ? " · " : ""}
                  {log.agent?.name ?? ""}
                </p>
              ) : null}
              <p className="mt-1 text-foreground/90">{log.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
