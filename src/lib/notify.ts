import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import type { NotificationType } from "@prisma/client";

/**
 * Single entry point for notifying a user: writes the in-app Notification
 * row (same as before) and fires a Web Push alert to their devices. Push
 * failures never block the in-app notification from being saved.
 */
export async function notifyUser({
  userId,
  type,
  message,
  propertyId,
  pushTitle = "ALL IN Real Estate",
  pushUrl,
}: {
  userId: string;
  type: NotificationType;
  message: string;
  propertyId?: string;
  pushTitle?: string;
  pushUrl?: string;
}) {
  await prisma.notification.create({ data: { userId, type, message, propertyId } });
  await sendPushToUser(userId, { title: pushTitle, body: message, url: pushUrl }).catch(() => {});
}

/**
 * Notifies every Manager (e.g. a new listing, a price change) — excluding
 * whoever triggered the action, since notifying yourself about your own
 * action doesn't make sense.
 */
export async function notifyManagers({
  excludeUserId,
  type,
  message,
  propertyId,
  pushUrl,
}: {
  excludeUserId?: string;
  type: NotificationType;
  message: string;
  propertyId?: string;
  pushUrl?: string;
}) {
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER", ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
    select: { id: true },
  });
  await Promise.all(
    managers.map((m) => notifyUser({ userId: m.id, type, message, propertyId, pushUrl })),
  );
}
