"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Always scoped to the calling session's own user — never a client-supplied userId. */
export async function saveOwnPushSubscription(subscription: SubscriptionInput) {
  const user = await requireUser(["AGENT", "MANAGER", "CLIENT"]);

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId: user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function deleteOwnPushSubscription(endpoint: string) {
  const user = await requireUser(["AGENT", "MANAGER", "CLIENT"]);
  // Scoped by userId too, not just endpoint — a user can only ever remove
  // their own subscription row.
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
}
