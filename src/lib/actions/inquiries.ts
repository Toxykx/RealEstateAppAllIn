"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export async function updateInquiry(inquiryId: string, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const status = formData.get("status") as string;

  await prisma.contactMessage.update({
    where: { id: inquiryId },
    data: { status: status as never, assignedAgentId: user.id },
  });

  revalidatePath("/manager/inquiries");
}
