"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import { KEY_STATUS_LABELS } from "@/lib/format";
import type { ActionResult } from "@/components/action-form";

export async function takeKey(propertyId: string): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  await prisma.property.update({
    where: { id: propertyId },
    data: { keyStatus: "WITH_AGENT", keyHolderId: user.id, keyLastTakenAt: new Date() },
  });

  await logActivity({
    activityType: "KEY_CHECKED_OUT",
    description: `${user.name} לקח/ה את המפתח מהמשרד.`,
    propertyId,
    agentId: user.id,
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "המפתח נלקח בהצלחה" };
}

export async function returnKey(propertyId: string): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  await prisma.property.update({
    where: { id: propertyId },
    data: { keyStatus: "IN_OFFICE", keyHolderId: null, keyLastReturnedAt: new Date() },
  });

  await logActivity({
    activityType: "KEY_RETURNED",
    description: `${user.name} החזיר/ה את המפתח למשרד.`,
    propertyId,
    agentId: user.id,
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "המפתח הוחזר בהצלחה" };
}

export async function setKeyStatus(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["MANAGER"]);
  const keyStatus = formData.get("keyStatus") as string;

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      keyStatus: keyStatus as never,
      ...(keyStatus === "IN_OFFICE" ? { keyHolderId: null, keyLastReturnedAt: new Date() } : {}),
    },
  });

  await logActivity({
    activityType: keyStatus === "IN_OFFICE" ? "KEY_RETURNED" : "KEY_CHECKED_OUT",
    description: `סטטוס המפתח עודכן ל-"${KEY_STATUS_LABELS[keyStatus] ?? keyStatus}" על ידי ${user.name}.`,
    propertyId,
    agentId: user.id,
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "סטטוס המפתח עודכן בהצלחה" };
}
