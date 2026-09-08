"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import type { ActionResult } from "@/components/action-form";
import type { PropertyType } from "@prisma/client";

function slugify(title: string, city: string) {
  return `${title}-${city}-${Date.now().toString(36)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Accepted header names per field (case-insensitive) — covers common Hebrew
// and English labels so a Monday.com board export mostly works as-is.
const HEADER_ALIASES: Record<string, string[]> = {
  title: ["כותרת", "שם", "title", "name"],
  street: ["רחוב", "כתובת", "street", "address"],
  description: ["תיאור", "description"],
  price: ["מחיר", "price"],
  propertyType: ["סוג", "סוג נכס", "type", "property type"],
  images: ["תמונות", "תמונה", "images", "photos", "photo"],
  bedrooms: ["חדרים", "bedrooms", "rooms"],
  bathrooms: ["חדרי רחצה", "bathrooms"],
  areaSqm: ["שטח", "area", "size"],
};

const PROPERTY_TYPE_ALIASES: Record<string, PropertyType> = {
  "דירה": "APARTMENT", apartment: "APARTMENT",
  "בית": "HOUSE", "בית פרטי": "HOUSE", house: "HOUSE",
  "וילה": "VILLA", villa: "VILLA",
  "מגרש": "LAND", land: "LAND",
  "מסחרי": "COMMERCIAL", commercial: "COMMERCIAL",
};

function findColumn(headerRow: string[], field: string): number {
  const aliases = HEADER_ALIASES[field];
  return headerRow.findIndex((h) => aliases.includes(h.trim().toLowerCase()));
}

export type ImportSummary = { created: number; skipped: number; errors: string[] };

export async function importPropertiesFromFile(formData: FormData): Promise<ActionResult> {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const file = formData.get("file") as File | null;
  const city = (formData.get("city") as string | null)?.trim();
  if (!file || file.size === 0) {
    return { success: false, message: "יש לבחור קובץ Excel" };
  }
  if (!city) {
    return { success: false, message: "יש לבחור עיר" };
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    return { success: false, message: "לא ניתן לקרוא את הקובץ. יש להעלות קובץ Excel (.xlsx) תקין." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) {
    return { success: false, message: "הקובץ ריק או חסרה שורת כותרות." };
  }

  // sheet.getRow(1).values is a sparse array (index 0 unused); Array.from
  // densifies it so findColumn's findIndex doesn't hit a hole and crash.
  const headerRow = Array.from(sheet.getRow(1).values as unknown[], (v) => String(v ?? ""));
  const col = {
    title: findColumn(headerRow, "title"),
    street: findColumn(headerRow, "street"),
    description: findColumn(headerRow, "description"),
    price: findColumn(headerRow, "price"),
    propertyType: findColumn(headerRow, "propertyType"),
    images: findColumn(headerRow, "images"),
    bedrooms: findColumn(headerRow, "bedrooms"),
    bathrooms: findColumn(headerRow, "bathrooms"),
    areaSqm: findColumn(headerRow, "areaSqm"),
  };
  if (col.title === -1 || col.street === -1 || col.description === -1 || col.price === -1) {
    return {
      success: false,
      message: "בקובץ חייבות להיות עמודות: כותרת, רחוב, תיאור, מחיר.",
    };
  }

  const existingTitles = new Set(
    (await prisma.property.findMany({ where: { agentId: user.id }, select: { title: true } })).map((p) => p.title),
  );

  const summary: ImportSummary = { created: 0, skipped: 0, errors: [] };

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber).values as (string | number | undefined)[];
    const title = String(row[col.title] ?? "").trim();
    if (!title) continue; // blank row

    if (existingTitles.has(title)) {
      summary.skipped++;
      continue;
    }

    const street = String(row[col.street] ?? "").trim();
    const description = String(row[col.description] ?? "").trim();
    const price = Number(row[col.price]);
    if (!street || !description || !Number.isFinite(price) || price <= 0) {
      summary.errors.push(`שורה ${rowNumber}: חסרים נתונים או מחיר לא תקין.`);
      continue;
    }

    const typeRaw = col.propertyType !== -1 ? String(row[col.propertyType] ?? "").trim().toLowerCase() : "";
    const propertyType: PropertyType = PROPERTY_TYPE_ALIASES[typeRaw] ?? "APARTMENT";

    const imagesRaw = col.images !== -1 ? String(row[col.images] ?? "") : "";
    const imageUrls = imagesRaw
      .split(/[;,\n]/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));

    const bedrooms = col.bedrooms !== -1 ? Number(row[col.bedrooms]) || null : null;
    const bathrooms = col.bathrooms !== -1 ? Number(row[col.bathrooms]) || null : null;
    const areaSqm = col.areaSqm !== -1 ? Number(row[col.areaSqm]) || null : null;

    try {
      const property = await prisma.property.create({
        data: {
          title,
          city,
          addressLine: street,
          description,
          price,
          propertyType,
          bedrooms,
          bathrooms,
          areaSqm,
          slug: slugify(title, city),
          agentId: user.id,
          images: {
            create: imageUrls.map((url, i) => ({
              url,
              storageKey: `imported:${Date.now()}-${i}`,
              isCover: i === 0,
              sortOrder: i,
            })),
          },
        },
      });

      await logActivity({
        activityType: "PROPERTY_CREATED",
        description: `הנכס "${property.title}" יובא מ-Excel על ידי ${user.name}.`,
        propertyId: property.id,
        agentId: user.id,
      });

      existingTitles.add(title);
      summary.created++;
    } catch {
      summary.errors.push(`שורה ${rowNumber}: שגיאה ביצירת הנכס.`);
    }
  }

  revalidatePath("/agent/properties");

  const parts = [`${summary.created} נכסים יובאו בהצלחה`];
  if (summary.skipped > 0) parts.push(`${summary.skipped} דולגו (כבר קיימים)`);
  if (summary.errors.length > 0) parts.push(`${summary.errors.length} שורות עם שגיאות`);

  return { success: summary.created > 0 || summary.errors.length === 0, message: parts.join(", ") };
}
