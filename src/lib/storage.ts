import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const IMAGE_BUCKET = "property-images";
export const DOCUMENT_BUCKET = "property-documents";

function buildStorageKey(propertyId: string, filename: string) {
  const ext = filename.includes(".") ? filename.split(".").pop() : undefined;
  const safeExt = ext ? `.${ext}` : "";
  return `${propertyId}/${randomUUID()}${safeExt}`;
}

/**
 * Uploads a property photo to the public image bucket and returns its
 * permanent public URL alongside the storage key (needed later to delete it).
 */
export async function uploadPropertyImage(
  propertyId: string,
  file: File | Blob,
  filename: string,
) {
  const storageKey = buildStorageKey(propertyId, filename);
  const { error } = await supabaseAdmin.storage
    .from(IMAGE_BUCKET)
    .upload(storageKey, file, { contentType: file.type || undefined });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(storageKey);
  return { storageKey, url: data.publicUrl };
}

/**
 * Uploads a property document (contract, ID, etc.) to the private document
 * bucket. Documents are never public — callers must request a signed URL.
 */
export async function uploadPropertyDocument(
  propertyId: string,
  file: File | Blob,
  filename: string,
) {
  const storageKey = buildStorageKey(propertyId, filename);
  const { error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .upload(storageKey, file, { contentType: file.type || undefined });

  if (error) throw error;
  return { storageKey };
}

/** Generates a time-limited signed URL for a private document. */
export async function getSignedDocumentUrl(storageKey: string, expiresInSeconds = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteStoredFile(bucket: string, storageKey: string) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([storageKey]);
  if (error) throw error;
}
