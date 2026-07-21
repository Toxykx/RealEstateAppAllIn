import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_ICONS } from "@/lib/activity-log";
import { formatDateTime } from "@/lib/format";
import type { ActivityType } from "@prisma/client";

export type ActivityLogEntry = {
  id: string;
  activityType: ActivityType;
  description: string;
  createdAt: Date;
  agent?: { name: string } | null;
};

export function ActivityLogList({ logs }: { logs: ActivityLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">עדיין אין פעילות רשומה.</p>;
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => {
        const Icon = ACTIVITY_TYPE_ICONS[log.activityType];
        return (
          <li key={log.id} className="flex gap-3 rounded-md border p-3 text-sm">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{ACTIVITY_TYPE_LABELS[log.activityType]}</span>
                <span>
                  {formatDateTime(log.createdAt)}
                  {log.agent?.name ? ` · ${log.agent.name}` : ""}
                </span>
              </div>
              <p className="mt-1 text-foreground/90">{log.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
