"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { uploadUserAvatar } from "@/lib/storage";
import type { ActionResult } from "@/components/action-form";

const profileSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
});

/**
 * Always scoped to the calling session's own user id — never accepts a
 * userId from the client, so an agent can only ever edit their own row.
 */
export async function updateOwnProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "אירעה שגיאה בשמירת הפרופיל" };
  }

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/agent/profile");
  return { success: true, message: "הפרופיל עודכן בהצלחה" };
}

export async function uploadOwnAvatar(formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, message: "יש לבחור קובץ תמונה" };
  }

  const { url } = await uploadUserAvatar(user.id, file, file.name);
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: url } });

  revalidatePath("/agent/profile");
  return { success: true, message: "התמונה עודכנה בהצלחה" };
}
