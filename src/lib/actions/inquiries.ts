"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import type { ActionResult } from "@/components/action-form";

export async function updateInquiry(inquiryId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const status = formData.get("status") as string;

  await prisma.contactMessage.update({
    where: { id: inquiryId },
    data: { status: status as never, assignedAgentId: user.id },
  });

  revalidatePath("/manager/inquiries");
  return { success: true, message: "סטטוס הפנייה עודכן בהצלחה" };
}
