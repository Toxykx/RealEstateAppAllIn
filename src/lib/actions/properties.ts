"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, requirePropertyOwner } from "@/lib/authz";
import { DEAL_STAGE_STEPS, LISTING_STATUS_LABELS } from "@/lib/format";
import { logActivity } from "@/lib/activity-log";
import { notifyUser, notifyManagers } from "@/lib/notify";
import type { ActionResult } from "@/components/action-form";
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
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const property = await prisma.property.create({
    data: {
      ...parsed.data,
      slug: slugify(parsed.data.title, parsed.data.city),
      agentId: user.id,
    },
  });

  await logActivity({
    activityType: "PROPERTY_CREATED",
    description: `הנכס "${property.title}" נוצר על ידי ${user.name}.`,
    propertyId: property.id,
    agentId: user.id,
  });

  await notifyManagers({
    excludeUserId: user.id,
    type: "PROPERTY_CREATED",
    message: `${user.name} הוסיף/ה נכס חדש: "${property.title}".`,
    propertyId: property.id,
    pushUrl: `/agent/properties/${property.id}`,
  });

  revalidatePath("/agent/properties");
  redirect(`/agent/properties/${property.id}?created=1`);
}

export async function updateProperty(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);

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
    return { success: false, message: parsed.error.issues[0]?.message ?? "אירעה שגיאה בשמירת הפרטים" };
  }

  const before = await prisma.property.findUnique({ where: { id: propertyId } });
  await prisma.property.update({ where: { id: propertyId }, data: parsed.data });

  // Logging/notifications don't affect the result shown to the user — defer
  // them until after the response is sent so the form doesn't sit waiting on
  // extra DB round trips the user never sees the outcome of.
  after(async () => {
    await logActivity({
      activityType: "PROPERTY_EDITED",
      description: `פרטי הנכס "${parsed.data.title}" נערכו על ידי ${user.name}.`,
      propertyId,
      agentId: user.id,
    });

    if (before && Number(before.price) !== parsed.data.price) {
      await logActivity({
        activityType: "PRICE_CHANGED",
        description: `המחיר עודכן מ-${before.price.toString()} ל-${parsed.data.price} ${parsed.data.currency}.`,
        propertyId,
        agentId: user.id,
      });

      await notifyManagers({
        excludeUserId: user.id,
        type: "PRICE_CHANGED",
        message: `המחיר עודכן עבור "${parsed.data.title}" על ידי ${user.name}: ${parsed.data.price} ${parsed.data.currency}.`,
        propertyId,
        pushUrl: `/agent/properties/${propertyId}`,
      });
    }
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "פרטי הנכס נשמרו בהצלחה" };
}

export async function assignPropertyToClient(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);
  const clientId = formData.get("clientId") as string;
  const clientIdValue = clientId && clientId !== "none" ? clientId : null;

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: { ownerClientId: clientIdValue },
  });

  if (clientIdValue) {
    after(async () => {
      await notifyUser({
        userId: clientIdValue,
        propertyId,
        type: "PROPERTY_ASSIGNED",
        message: `הנכס ${property.title} הוקצה לך.`,
        pushUrl: `/client/properties/${propertyId}`,
      });

      await logActivity({
        activityType: "CLIENT_ASSIGNED",
        description: `הנכס "${property.title}" הוקצה ללקוח על ידי ${user.name}.`,
        propertyId,
        agentId: user.id,
        clientId: clientIdValue,
      });
    });
  }

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "הלקוח המוקצה עודכן בהצלחה" };
}

export async function reassignPropertyAgent(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["MANAGER"]);
  const agentId = formData.get("agentId") as string;
  if (!agentId) return { success: false, message: "יש לבחור מתווך" };

  const [property, newAgent] = await Promise.all([
    prisma.property.update({ where: { id: propertyId }, data: { agentId } }),
    prisma.user.findUnique({ where: { id: agentId } }),
  ]);

  after(async () => {
    await logActivity({
      activityType: "AGENT_ASSIGNED",
      description: `המתווך האחראי על "${property.title}" הוחלף ל-${newAgent?.name} על ידי ${user.name}.`,
      propertyId,
      agentId: user.id,
    });
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "המתווך האחראי עודכן בהצלחה" };
}

export async function changeListingStatus(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);
  const listingStatus = formData.get("listingStatus") as string;

  const before = await prisma.property.findUnique({ where: { id: propertyId } });
  await prisma.property.update({
    where: { id: propertyId },
    data: { listingStatus: listingStatus as never },
  });

  after(async () => {
    await logActivity({
      activityType: "STATUS_CHANGED",
      description: `סטטוס הפרסום עודכן ל-"${LISTING_STATUS_LABELS[listingStatus] ?? listingStatus}" על ידי ${user.name}.`,
      propertyId,
      agentId: user.id,
    });

    if (listingStatus === "AVAILABLE" && before?.listingStatus !== "AVAILABLE") {
      await logActivity({
        activityType: "PROPERTY_PUBLISHED",
        description: `הנכס פורסם בקטלוג על ידי ${user.name}.`,
        propertyId,
        agentId: user.id,
      });

      if (before?.ownerClientId) {
        await notifyUser({
          userId: before.ownerClientId,
          type: "PROPERTY_PUBLISHED",
          message: `הנכס ${before.title} פורסם בקטלוג!`,
          propertyId,
          pushUrl: `/client/properties/${propertyId}`,
        });
      }
    }
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "סטטוס הפרסום עודכן בהצלחה" };
}

export async function changeDealStage(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);
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
      message: `השלב עודכן ל-"${stepLabel}".`,
      stageChangedTo: dealStage,
      createdById: user.id,
      isInternal: false,
    },
  });

  after(async () => {
    if (property.ownerClientId) {
      await notifyUser({
        userId: property.ownerClientId,
        propertyId,
        type: "STAGE_CHANGE",
        message: `הנכס ${property.title} עודכן ל-"${stepLabel}".`,
        pushUrl: `/client/properties/${propertyId}`,
      });
    }

    await logActivity({
      activityType: "STAGE_CHANGED",
      description: `שלב העסקה של "${property.title}" עודכן ל-"${stepLabel}" על ידי ${user.name}.`,
      propertyId,
      agentId: user.id,
    });

    if (dealStage === "SOLD") {
      await logActivity({
        activityType: "DEAL_CLOSED",
        description: `העסקה על "${property.title}" נסגרה בהצלחה.`,
        propertyId,
        agentId: user.id,
      });
    }
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "שלב העסקה עודכן בהצלחה" };
}

const updateSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean(),
});

export async function postPropertyUpdate(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = updateSchema.safeParse({
    message: formData.get("message"),
    isInternal: formData.get("isInternal") === "on",
  });
  if (!parsed.success) {
    return { success: false, message: "יש להזין תוכן לעדכון" };
  }

  await prisma.propertyUpdate.create({
    data: {
      propertyId,
      message: parsed.data.message,
      isInternal: parsed.data.isInternal,
      createdById: user.id,
    },
  });

  after(async () => {
    if (!parsed.data.isInternal) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (property?.ownerClientId) {
        await notifyUser({
          userId: property.ownerClientId,
          propertyId,
          type: "NEW_UPDATE",
          message: `עדכון חדש על הנכס ${property.title}.`,
          pushUrl: `/client/properties/${propertyId}`,
        });
      }
    }

    await logActivity({
      activityType: "TIMELINE_UPDATE_ADDED",
      description: `${user.name} פרסם/ה עדכון בציר הזמן.`,
      propertyId,
      agentId: user.id,
    });
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "העדכון פורסם בהצלחה" };
}

const visitSchema = z.object({
  scheduledAt: z.string().min(1),
  visitorName: z.string().optional(),
  visitorPhone: z.string().optional(),
  notes: z.string().optional(),
});

async function scheduleVisitCore(
  user: { id: string; name?: string | null },
  propertyId: string,
  data: z.infer<typeof visitSchema>,
): Promise<ActionResult> {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return { success: false, message: "הנכס לא נמצא" };
  }

  await prisma.visit.create({
    data: {
      propertyId,
      scheduledAt: new Date(data.scheduledAt),
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      notes: data.notes,
      clientId: property.ownerClientId,
      createdById: user.id,
    },
  });

  after(async () => {
    if (property.ownerClientId) {
      await notifyUser({
        userId: property.ownerClientId,
        propertyId,
        type: "VISIT_SCHEDULED",
        message: `נקבע ביקור עבור הנכס ${property.title}.`,
        pushUrl: `/client/properties/${propertyId}`,
      });
    }

    await logActivity({
      activityType: "VISIT_SCHEDULED",
      description: `${user.name} קבע/ה ביקור עבור "${property.title}".`,
      propertyId,
      agentId: user.id,
      clientId: property.ownerClientId ?? undefined,
    });
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "הביקור נקבע בהצלחה" };
}

export async function scheduleVisit(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const parsed = visitSchema.safeParse({
    scheduledAt: formData.get("scheduledAt"),
    visitorName: formData.get("visitorName") || undefined,
    visitorPhone: formData.get("visitorPhone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: "יש לבחור תאריך ושעה לביקור" };
  }

  return scheduleVisitCore(user, propertyId, parsed.data);
}

// Same as scheduleVisit, but reads the property from the form itself — used
// by the quick "add appointment" shortcut in the nav, which isn't scoped to
// a single property's page.
export async function quickScheduleVisit(formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const propertyId = formData.get("propertyId") as string;
  if (!propertyId) {
    return { success: false, message: "יש לבחור נכס" };
  }

  const parsed = visitSchema.safeParse({
    scheduledAt: formData.get("scheduledAt"),
    visitorName: formData.get("visitorName") || undefined,
    visitorPhone: formData.get("visitorPhone") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { success: false, message: "יש לבחור תאריך ושעה לפגישה" };
  }

  return scheduleVisitCore(user, propertyId, parsed.data);
}

export async function updateVisitStatus(propertyId: string, visitId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const status = formData.get("status") as string;

  const visit = await prisma.visit.update({ where: { id: visitId }, data: { status: status as never } });

  if (status === "COMPLETED" || status === "CANCELLED") {
    after(async () => {
      await logActivity({
        activityType: status === "COMPLETED" ? "VISIT_COMPLETED" : "VISIT_CANCELLED",
        description: status === "COMPLETED" ? `הביקור הושלם.` : `הביקור בוטל.`,
        propertyId,
        agentId: user.id,
        clientId: visit.clientId ?? undefined,
      });
    });
  }

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "סטטוס הביקור עודכן בהצלחה" };
}
