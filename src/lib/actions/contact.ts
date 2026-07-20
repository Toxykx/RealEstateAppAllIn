"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  propertyId: z.string().optional(),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    propertyId: formData.get("propertyId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  return { success: true };
}
