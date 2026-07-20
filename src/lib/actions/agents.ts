"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["AGENT", "MANAGER"]),
});

export async function createAgent(_prevState: { error?: string } | undefined, formData: FormData) {
  await requireUser(["MANAGER"]);

  const parsed = createAgentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "A user with this email already exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const agent = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/manager/agents");
  redirect(`/manager/agents/${agent.id}`);
}

const updateAgentSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["AGENT", "MANAGER"]),
  isActive: z.boolean(),
});

export async function updateAgent(agentId: string, formData: FormData) {
  await requireUser(["MANAGER"]);

  const parsed = updateAgentSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return;

  await prisma.user.update({ where: { id: agentId }, data: parsed.data });

  revalidatePath(`/manager/agents/${agentId}`);
  revalidatePath("/manager/agents");
}
