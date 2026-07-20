"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export async function markAllNotificationsRead(_formData: FormData) {
  const user = await requireUser(["CLIENT"]);
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/client/updates");
  revalidatePath("/client");
}
