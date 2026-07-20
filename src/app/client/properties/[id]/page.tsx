import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { getSignedDocumentUrl } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEAL_STAGE_STEPS,
  LISTING_STATUS_LABELS,
  dealStageIndex,
  formatDateTime,
  formatPrice,
} from "@/lib/format";

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "חוזה",
  ID: "תעודה מזהה",
  OTHER: "אחר",
};

const VISIT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "מתוכנן",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

export default async function ClientPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(["CLIENT"]);

  const property = await prisma.property.findFirst({
    where: { id, ownerClientId: user.id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      documents: { where: { visibleToClient: true }, orderBy: { createdAt: "desc" } },
      updates: { where: { isInternal: false }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      visits: { orderBy: { scheduledAt: "asc" } },
      agent: { select: { name: true, phone: true, email: true } },
    },
  });
  if (!property) notFound();

  const documentsWithUrls = await Promise.all(
    property.documents.map(async (doc) => ({
      ...doc,
      signedUrl: await getSignedDocumentUrl(doc.storageKey).catch(() => null),
    })),
  );

  const currentStageIndex = dealStageIndex(property.dealStage);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/client" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה לנכסים שלי
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
        </div>
        <p className="text-muted-foreground">
          {property.addressLine}, {property.city}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {property.images.length === 0 ? (
          <div className="col-span-full flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground">
            אין תמונות עדיין
          </div>
        ) : (
          property.images.map((image, i) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-lg bg-muted ${
                i === 0 ? "col-span-2 aspect-video sm:col-span-4" : "aspect-square"
              }`}
            >
              <Image src={image.url} alt={property.title} fill className="object-cover" />
            </div>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">פרטים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-primary">
              {formatPrice(property.price.toString(), property.currency)}
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed">{property.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">הסוכן שלך</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{property.agent.name}</p>
            {property.agent.phone && <p className="text-muted-foreground">{property.agent.phone}</p>}
            <p className="text-muted-foreground">{property.agent.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">התקדמות</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {DEAL_STAGE_STEPS.map((step, i) => (
              <li key={step.value} className="flex items-center gap-2">
                <span>{i < currentStageIndex ? "✔" : i === currentStageIndex ? "🟡" : "⬜"}</span>
                <span className={i === currentStageIndex ? "font-medium" : "text-muted-foreground"}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ציר זמן</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {property.updates.length === 0 && (
            <p className="text-sm text-muted-foreground">עדיין אין עדכונים.</p>
          )}
          {property.updates.map((update) => (
            <div key={update.id} className="rounded-md border p-3 text-sm">
              <p className="mb-1 text-xs text-muted-foreground">
                {formatDateTime(update.createdAt)} · {update.createdBy.name}
              </p>
              <p>{update.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">מסמכים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documentsWithUrls.length === 0 && (
              <p className="text-sm text-muted-foreground">עדיין לא שותפו מסמכים.</p>
            )}
            {documentsWithUrls.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                {doc.signedUrl ? (
                  <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {doc.name}
                  </a>
                ) : (
                  <span>{doc.name}</span>
                )}
                <Badge variant="outline">{DOC_TYPE_LABELS[doc.docType] ?? doc.docType}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ביקורים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {property.visits.length === 0 && (
              <p className="text-sm text-muted-foreground">אין ביקורים מתוכננים.</p>
            )}
            {property.visits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>{formatDateTime(visit.scheduledAt)}</span>
                <Badge variant="secondary">{VISIT_STATUS_LABELS[visit.status] ?? visit.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
