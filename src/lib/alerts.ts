import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

// Tunable thresholds — adjust here if the agency wants different alert sensitivity.
const KEY_OVERDUE_DAYS = 3;
const STALE_PROPERTY_DAYS = 14;
const NO_ACTIVITY_DAYS = 30;
const RECENT_CANCELLED_VISIT_DAYS = 7;

export type ManagerAlertType =
  | "KEY_NOT_RETURNED"
  | "STALE_PROPERTY"
  | "NO_ACTIVITY"
  | "VISIT_CANCELLED"
  | "MISSING_IMAGES"
  | "NO_CLIENT"
  | "CLIENT_WAITING";

export type ManagerAlert = {
  id: string;
  type: ManagerAlertType;
  message: string;
  propertyId?: string;
  createdAt: Date;
};

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export async function getManagerAlerts(): Promise<ManagerAlert[]> {
  const alerts: ManagerAlert[] = [];

  const activeProperties = await prisma.property.findMany({
    where: { listingStatus: { notIn: ["SOLD", "RENTED", "ARCHIVED"] } },
    include: {
      _count: { select: { images: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const keyOverdueCutoff = daysAgo(KEY_OVERDUE_DAYS);
  const noActivityCutoff = daysAgo(NO_ACTIVITY_DAYS);
  const staleCutoff = daysAgo(STALE_PROPERTY_DAYS);

  for (const property of activeProperties) {
    if (property.keyStatus === "WITH_AGENT" && property.keyLastTakenAt && property.keyLastTakenAt < keyOverdueCutoff) {
      alerts.push({
        id: `key-${property.id}`,
        type: "KEY_NOT_RETURNED",
        message: `המפתח של "${property.title}" לא הוחזר מעל ${KEY_OVERDUE_DAYS} ימים.`,
        propertyId: property.id,
        createdAt: property.keyLastTakenAt,
      });
    }

    const lastActivity = property.activityLogs[0]?.createdAt ?? property.createdAt;
    if (lastActivity < noActivityCutoff) {
      alerts.push({
        id: `no-activity-${property.id}`,
        type: "NO_ACTIVITY",
        message: `לא נרשמה פעילות בנכס "${property.title}" מעל ${NO_ACTIVITY_DAYS} יום.`,
        propertyId: property.id,
        createdAt: lastActivity,
      });
    } else if (lastActivity < staleCutoff) {
      alerts.push({
        id: `stale-${property.id}`,
        type: "STALE_PROPERTY",
        message: `הנכס "${property.title}" לא עודכן מעל ${STALE_PROPERTY_DAYS} ימים.`,
        propertyId: property.id,
        createdAt: lastActivity,
      });
    }

    if (property._count.images === 0) {
      alerts.push({
        id: `no-images-${property.id}`,
        type: "MISSING_IMAGES",
        message: `לנכס "${property.title}" אין תמונות.`,
        propertyId: property.id,
        createdAt: property.createdAt,
      });
    }

    if (!property.ownerClientId) {
      alerts.push({
        id: `no-client-${property.id}`,
        type: "NO_CLIENT",
        message: `לנכס "${property.title}" אין לקוח משויך.`,
        propertyId: property.id,
        createdAt: property.createdAt,
      });
    }
  }

  const waitingInquiries = await prisma.contactMessage.findMany({
    where: { status: "NEW" },
    orderBy: { createdAt: "desc" },
  });
  for (const inquiry of waitingInquiries) {
    alerts.push({
      id: `waiting-${inquiry.id}`,
      type: "CLIENT_WAITING",
      message: `${inquiry.name} ממתין/ה למענה מ-${formatDateTime(inquiry.createdAt)}.`,
      createdAt: inquiry.createdAt,
    });
  }

  const cancelledVisits = await prisma.activityLog.findMany({
    where: { activityType: "VISIT_CANCELLED", createdAt: { gte: daysAgo(RECENT_CANCELLED_VISIT_DAYS) } },
    include: { property: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  for (const log of cancelledVisits) {
    alerts.push({
      id: `cancel-${log.id}`,
      type: "VISIT_CANCELLED",
      message: log.property ? `ביקור בוטל בנכס "${log.property.title}".` : "ביקור בוטל.",
      propertyId: log.propertyId ?? undefined,
      createdAt: log.createdAt,
    });
  }

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
