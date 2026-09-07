import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Guarded rather than called unconditionally at module load: this module is
// imported from every property/key/upload server action (via notify.ts), so
// if the VAPID env vars are ever missing (e.g. not yet added to a new
// deploy target), core CRUD actions must keep working — push just quietly
// no-ops instead of taking down everything that imports this file.
const vapidConfigured = Boolean(
  process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
);
if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

/**
 * Sends a Web Push notification to every device a user has subscribed on.
 * Silently drops (and cleans up) subscriptions the push service reports as
 * gone (410) or unknown (404) — e.g. the user uninstalled the PWA.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!vapidConfigured) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }),
  );
}
