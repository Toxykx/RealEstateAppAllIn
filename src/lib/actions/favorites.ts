"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export async function toggleFavorite(propertyId: string) {
  const user = await requireUser(["CLIENT"]);

  const existing = await prisma.favorite.findUnique({
    where: { clientId_propertyId: { clientId: user.id, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { clientId: user.id, propertyId } });
  }

  revalidatePath("/client/search");
  return { added: !existing };
}
