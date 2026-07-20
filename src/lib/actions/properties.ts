"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { DEAL_STAGE_STEPS } from "@/lib/format";
import type { DealStage } from "@prisma/client";

function slugify(title: string, city: string) {
  return `${title}-${city}-${Date.now().toString(36)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const propertySchema = z.object({
  title: z.string().min(1),
  city: z.string().min(1),
  addressLine: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  currency: z.string().min(1).default("ILS"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "LAND", "COMMERCIAL"]),
  bedrooms: z.coerce.number().int().optional().nullable(),
  bathrooms: z.coerce.number().int().optional().nullable(),
  areaSqm: z.coerce.number().optional().nullable(),
});

export async function createProperty(_prevState: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = propertySchema.safeParse({
    title: formData.get("title"),
    city: formData.get("city"),
    addressLine: formData.get("addressLine"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "ILS",
    propertyType: formData.get("propertyType"),
    bedrooms: formData.get("bedrooms") || null,
    bathrooms: formData.get("bathrooms") || null,
    areaSqm: formData.get("areaSqm") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const property = await prisma.property.create({
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.title, parsed.data.city),
      agentId: user.id,
    },
  });

  revalidatePath("/agent/properties");
  redirect(`/agent/properties/${property.id}`);
}

export async function updateProperty(propertyId: string, formData: FormData) {
  await requireUser(["AGENT", "MANAGER"]);

  const parsed = propertySchema.safeParse({
    title: formData.get("title"),
    city: formData.get("city"),
    addressLine: formData.get("addressLine"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "ILS",
    propertyType: formData.get("propertyType"),
    bedrooms: formData.get("bedrooms") || null,
    bathrooms: formData.get("bathrooms") || null,
    areaSqm: formData.get("areaSqm") || null,
  });
  if (!parsed.success) return;

  await prisma.property.update({ where: { id: propertyId }, data: parsed.data });
  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function assignPropertyToClient(propertyId: string, formData: FormData) {
  await requireUser(["AGENT", "MANAGER"]);
  const clientId = formData.get("clientId") as string;

  await prisma.property.update({
    where: { id: propertyId },
    data: { ownerClientId: clientId || null },
  });

  if (clientId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    await prisma.notification.create({
      data: {
        userId: clientId,
        propertyId,
        type: "PROPERTY_ASSIGNED",
        message: `${property?.title} has been assigned to you.`,
      },
    });
  }

  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function changeListingStatus(propertyId: string, formData: FormData) {
  await requireUser(["AGENT", "MANAGER"]);
  const listingStatus = formData.get("listingStatus") as string;

  await prisma.property.update({
    where: { id: propertyId },
    data: { listingStatus: listingStatus as never },
  });

  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function changeDealStage(propertyId: string, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const dealStage = formData.get("dealStage") as DealStage;

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: {
      dealStage,
      // Reaching SOLD is the one transition that always implies the public listing status too.
      ...(dealStage === "SOLD" ? { listingStatus: "SOLD" } : {}),
    },
  });

  const stepLabel = DEAL_STAGE_STEPS.find((s) => s.value === dealStage)?.label ?? dealStage;

  await prisma.propertyUpdate.create({
    data: {
      propertyId,
      message: `Stage moved to "${stepLabel}".`,
      stageChangedTo: dealStage,
      createdById: user.id,
      isInternal: false,
    },
  });

  if (property.ownerClientId) {
    await prisma.notification.create({
      data: {
        userId: property.ownerClientId,
        propertyId,
        type: "STAGE_CHANGE",
        message: `${property.title} moved to "${stepLabel}".`,
      },
    });
  }

  revalidatePath(`/agent/properties/${propertyId}`);
}

const updateSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean(),
});

export async function postPropertyUpdate(propertyId: string, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = updateSchema.safeParse({
    message: formData.get("message"),
    isInternal: formData.get("isInternal") === "on",
  });
  if (!parsed.success) return;

  await prisma.propertyUpdate.create({
    data: {
      propertyId,
      message: parsed.data.message,
      isInternal: parsed.data.isInternal,
      createdById: user.id,
    },
  });

  if (!parsed.data.isInternal) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (property?.ownerClientId) {
      await prisma.notification.create({
        data: {
          userId: property.ownerClientId,
          propertyId,
          type: "NEW_UPDATE",
          message: `New update on ${property.title}.`,
        },
      });
    }
  }

  revalidatePath(`/agent/properties/${propertyId}`);
}

const visitSchema = z.object({
  scheduledAt: z.string().min(1),
  visitorName: z.string().optional(),
  visitorPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function scheduleVisit(propertyId: string, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = visitSchema.safeParse({
    scheduledAt: formData.get("scheduledAt"),
    visitorName: formData.get("visitorName") || undefined,
    visitorPhone: formData.get("visitorPhone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return;

  const property = await prisma.property.findUnique({ where: { id: propertyId } });

  await prisma.visit.create({
    data: {
      propertyId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      visitorName: parsed.data.visitorName,
      visitorPhone: parsed.data.visitorPhone,
      notes: parsed.data.notes,
      clientId: property?.ownerClientId,
      createdById: user.id,
    },
  });

  if (property?.ownerClientId) {
    await prisma.notification.create({
      data: {
        userId: property.ownerClientId,
        propertyId,
        type: "VISIT_SCHEDULED",
        message: `A visit was scheduled for ${property.title}.`,
      },
    });
  }

  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function updateVisitStatus(propertyId: string, visitId: string, formData: FormData) {
  await requireUser(["AGENT", "MANAGER"]);
  const status = formData.get("status") as string;

  await prisma.visit.update({ where: { id: visitId }, data: { status: status as never } });
  revalidatePath(`/agent/properties/${propertyId}`);
}
