"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import type { ActionResult } from "@/components/action-form";

const createClientSchema = z.object({
  name: z.string().min(1, "יש להזין שם"),
  email: z.string().email("יש להזין אימייל תקין"),
  phone: z.string().optional(),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

export async function createClient(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "כבר קיים משתמש עם אימייל זה" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const client = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "CLIENT",
      managingAgentId: user.id,
    },
  });

  revalidatePath("/agent/clients");
  redirect(`/agent/clients/${client.id}?created=1`);
}

const updateClientSchema = z.object({
  name: z.string().min(1, "יש להזין שם"),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
  await requireUser(["AGENT", "MANAGER"]);

  const parsed = updateClientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "אירעה שגיאה" };
  }

  await prisma.user.update({
    where: { id: clientId },
    data: parsed.data,
  });

  revalidatePath(`/agent/clients/${clientId}`);
  revalidatePath("/agent/clients");
  return { success: true, message: "פרטי הלקוח נשמרו בהצלחה" };
}
