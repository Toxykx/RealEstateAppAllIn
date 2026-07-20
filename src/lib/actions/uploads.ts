"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import {
  deleteStoredFile,
  uploadPropertyDocument,
  uploadPropertyImage,
  IMAGE_BUCKET,
  DOCUMENT_BUCKET,
} from "@/lib/storage";

export async function uploadImageAction(propertyId: string, formData: FormData) {
  await requireUser(["AGENT", "MANAGER"]);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

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
}

export async function deleteImageAction(propertyId: string, imageId: string) {
  await requireUser(["AGENT", "MANAGER"]);

  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await prisma.propertyImage.delete({ where: { id: imageId } });
  await deleteStoredFile(IMAGE_BUCKET, image.storageKey).catch(() => {});

  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function uploadDocumentAction(propertyId: string, formData: FormData) {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

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

  if (visibleToClient) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (property?.ownerClientId) {
      await prisma.notification.create({
        data: {
          userId: property.ownerClientId,
          propertyId,
          type: "NEW_DOCUMENT",
          message: `A new document was added to ${property.title}.`,
        },
      });
    }
  }

  revalidatePath(`/agent/properties/${propertyId}`);
}

export async function deleteDocumentAction(propertyId: string, documentId: string) {
  await requireUser(["AGENT", "MANAGER"]);

  const doc = await prisma.propertyDocument.findUnique({ where: { id: documentId } });
  if (!doc) return;

  await prisma.propertyDocument.delete({ where: { id: documentId } });
  await deleteStoredFile(DOCUMENT_BUCKET, doc.storageKey).catch(() => {});

  revalidatePath(`/agent/properties/${propertyId}`);
}
