"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requirePropertyOwner } from "@/lib/authz";
import {
  deleteStoredFile,
  uploadPropertyDocument,
  uploadPropertyImage,
  IMAGE_BUCKET,
  DOCUMENT_BUCKET,
} from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { notifyUser } from "@/lib/notify";
import type { ActionResult } from "@/components/action-form";

export async function uploadImageAction(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, message: "יש לבחור קובץ תמונה" };
  }

  const existingCount = await prisma.propertyImage.count({ where: { propertyId } });
  const { storageKey, url } = await uploadPropertyImage(propertyId, file, file.name);

  await prisma.propertyImage.create({
    data: {
      propertyId,
      url,
      storageKey,
      isCover: existingCount === 0,
      sortOrder: existingCount,
    },
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "התמונה הועלתה בהצלחה" };
}

export async function deleteImageAction(propertyId: string, imageId: string): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);

  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, message: "התמונה לא נמצאה" };

  await prisma.propertyImage.delete({ where: { id: imageId } });
  await deleteStoredFile(IMAGE_BUCKET, image.storageKey).catch(() => {});

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "התמונה נמחקה בהצלחה" };
}

export async function uploadDocumentAction(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, message: "יש לבחור קובץ מסמך" };
  }

  const docType = (formData.get("docType") as string) || "OTHER";
  const visibleToClient = formData.get("visibleToClient") === "on";

  const { storageKey } = await uploadPropertyDocument(propertyId, file, file.name);

  await prisma.propertyDocument.create({
    data: {
      propertyId,
      name: file.name,
      fileUrl: storageKey,
      storageKey,
      docType: docType as never,
      visibleToClient,
      uploadedById: user.id,
    },
  });

  after(async () => {
    if (visibleToClient) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (property?.ownerClientId) {
        await notifyUser({
          userId: property.ownerClientId,
          propertyId,
          type: "NEW_DOCUMENT",
          message: `נוסף מסמך חדש לנכס ${property.title}.`,
          pushUrl: `/client/properties/${propertyId}`,
        });
      }
    }

    await logActivity({
      activityType: "DOCUMENT_UPLOADED",
      description: `${user.name} העלה/תה מסמך: "${file.name}".`,
      propertyId,
      agentId: user.id,
    });
  });

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "המסמך הועלה בהצלחה" };
}

export async function deleteDocumentAction(propertyId: string, documentId: string): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);
  await requirePropertyOwner(user, propertyId);

  const doc = await prisma.propertyDocument.findUnique({ where: { id: documentId } });
  if (!doc) return { success: false, message: "המסמך לא נמצא" };

  await prisma.propertyDocument.delete({ where: { id: documentId } });
  await deleteStoredFile(DOCUMENT_BUCKET, doc.storageKey).catch(() => {});

  revalidatePath(`/agent/properties/${propertyId}`);
  return { success: true, message: "המסמך נמחק בהצלחה" };
}
