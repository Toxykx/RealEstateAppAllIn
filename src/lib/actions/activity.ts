"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import type { ActionResult } from "@/components/action-form";

const schema = z.object({
  activityType: z.enum(["CALL_LOGGED", "MEETING_LOGGED"]),
  note: z.string().min(1),
  clientId: z.string().optional(),
  propertyId: z.string().optional(),
});

export async function logManualActivity(formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = schema.safeParse({
    activityType: formData.get("activityType"),
    note: formData.get("note"),
    clientId: formData.get("clientId") || undefined,
    propertyId: formData.get("propertyId") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: "יש לבחור סוג פעילות ולהזין תיאור" };
  }

  const clientId = parsed.data.clientId && parsed.data.clientId !== "none" ? parsed.data.clientId : undefined;
  const propertyId = parsed.data.propertyId && parsed.data.propertyId !== "none" ? parsed.data.propertyId : undefined;

  await logActivity({
    activityType: parsed.data.activityType,
    description: parsed.data.note,
    agentId: user.id,
    clientId,
    propertyId,
  });

  if (clientId) revalidatePath(`/agent/clients/${clientId}`);
  if (propertyId) revalidatePath(`/agent/properties/${propertyId}`);

  return { success: true, message: "הפעילות תועדה בהצלחה" };
}
