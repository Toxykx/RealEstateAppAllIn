import { prisma } from "@/lib/prisma";
import type { Prisma, PropertyType } from "@prisma/client";

export type PublicPropertyFilters = {
  q?: string;
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
};

const publicListingStatuses = ["AVAILABLE", "IN_PROGRESS"] as const;

export async function getPublicProperties(filters: PublicPropertyFilters = {}) {
  const where: Prisma.PropertyWhereInput = {
    listingStatus: { in: [...publicListingStatuses] },
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
      { addressLine: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };
  if (filters.propertyType) where.propertyType = filters.propertyType as PropertyType;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return properties.map(serializeProperty);
}

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!property) return null;
  return { ...serializeProperty(property), agent: property.agent };
}

export function serializeProperty<
  T extends { price: Prisma.Decimal; images?: { url: string; isCover: boolean }[] },
>(property: T) {
  const cover = property.images?.find((i) => i.isCover) ?? property.images?.[0];
  return {
    ...property,
    price: Number(property.price),
    coverImageUrl: cover?.url ?? null,
  };
}

export async function getDistinctCities() {
  const rows = await prisma.property.findMany({
    where: { listingStatus: { in: [...publicListingStatuses] } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return rows.map((r) => r.city);
}
