import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  STAGE_CHANGE: "Stage update",
  NEW_UPDATE: "New update",
  NEW_DOCUMENT: "New document",
  VISIT_SCHEDULED: "Visit scheduled",
  PROPERTY_ASSIGNED: "Property assigned",
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
        <h1 className="text-2xl font-bold">Updates</h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">No updates yet.</p>
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
                    {!notification.isRead && <Badge>New</Badge>}
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
