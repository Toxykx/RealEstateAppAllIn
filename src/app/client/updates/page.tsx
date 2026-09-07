import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { ActionForm } from "@/components/action-form";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  STAGE_CHANGE: "עדכון שלב",
  NEW_UPDATE: "עדכון חדש",
  NEW_DOCUMENT: "מסמך חדש",
  VISIT_SCHEDULED: "ביקור נקבע",
  PROPERTY_ASSIGNED: "נכס הוקצה",
  PROPERTY_PUBLISHED: "נכס פורסם",
};

export default async function UpdatesPage() {
  const user = await requireUser(["CLIENT"]);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { id: true, title: true } } },
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">עדכונים</h1>
        {hasUnread && (
          <ActionForm action={markAllNotificationsRead}>
            <SubmitButton variant="outline" size="sm" pendingLabel="מסמן...">
              סימון הכל כנקרא
            </SubmitButton>
          </ActionForm>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            message="עדיין אין עדכונים"
            description="עדכוני סטטוס, מסמכים וביקורים על הנכסים שלך יופיעו כאן."
          />
        )}
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={notification.property ? `/client/properties/${notification.property.id}` : "/client"}
          >
            <Card className={!notification.isRead ? "border-primary/40 bg-primary/5" : undefined}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TYPE_LABELS[notification.type] ?? notification.type}</Badge>
                    {!notification.isRead && <Badge>חדש</Badge>}
                  </div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
