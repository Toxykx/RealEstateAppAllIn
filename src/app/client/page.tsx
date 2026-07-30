import Link from "next/link";
import { prisma, withDbRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { serializeProperty } from "@/lib/properties";
import { getSignedDocumentUrl } from "@/lib/storage";
import { PropertyCard } from "@/components/property/property-card";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, CalendarDays, MessageSquareText, FileText, Bell } from "lucide-react";
import { formatDateTime } from "@/lib/format";

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "חוזה",
  ID: "תעודה מזהה",
  OTHER: "אחר",
};

export default async function ClientHomePage() {
  const sessionUser = await requireUser(["CLIENT"]);

  const [user, ownedProperties, upcomingVisits, latestUpdates, recentDocuments, recentNotifications] =
    await withDbRetry(() => Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: sessionUser.id },
        include: { managingAgent: { select: { name: true, phone: true, email: true } } },
      }),
      prisma.property.findMany({
        where: { ownerClientId: sessionUser.id },
        include: { images: { orderBy: { sortOrder: "asc" } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.visit.findMany({
        where: { clientId: sessionUser.id, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: { property: { select: { title: true, id: true } } },
      }),
      prisma.propertyUpdate.findMany({
        where: { isInternal: false, property: { ownerClientId: sessionUser.id } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { property: { select: { title: true, id: true } } },
      }),
      prisma.propertyDocument.findMany({
        where: { visibleToClient: true, property: { ownerClientId: sessionUser.id } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { property: { select: { title: true, id: true } } },
      }),
      prisma.notification.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]));

  const documentsWithUrls = await Promise.all(
    recentDocuments.map(async (doc) => ({
      ...doc,
      signedUrl: await getSignedDocumentUrl(doc.storageKey).catch(() => null),
    })),
  );

  const cardProperties = ownedProperties.map((property) => ({
    ...serializeProperty(property),
    slug: property.slug,
  }));

  const whatsappReference = ownedProperties[0] ? `${ownedProperties[0].title}, ${ownedProperties[0].city}` : "פנייה כללית";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">שלום {user.name?.split(" ")[0]}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">הנכסים שלי</CardTitle>
          </CardHeader>
          <CardContent>
            {cardProperties.length === 0 ? (
              <EmptyState icon={Home} message="עדיין לא הוקצו לך נכסים. המתווך שלך יוסיף נכס כאן ברגע שיהיה מוכן." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cardProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} href={`/client/properties/${property.id}`} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {user.managingAgent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">המתווך שלך</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">{user.managingAgent.name}</p>
              {user.managingAgent.phone && <p className="text-muted-foreground">{user.managingAgent.phone}</p>}
              <p className="text-muted-foreground">{user.managingAgent.email}</p>
              {user.managingAgent.phone && (
                <WhatsAppButton phone={user.managingAgent.phone} propertyReference={whatsappReference} />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-4 w-4" /> ביקורים קרובים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingVisits.length === 0 && <p className="text-sm text-muted-foreground">אין ביקורים מתוכננים.</p>}
            {upcomingVisits.map((visit) => (
              <Link
                key={visit.id}
                href={`/client/properties/${visit.property.id}`}
                className="block rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <p className="font-medium">{visit.property.title}</p>
                <p className="text-muted-foreground">{formatDateTime(visit.scheduledAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquareText className="h-4 w-4" /> עדכונים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestUpdates.length === 0 && <p className="text-sm text-muted-foreground">עדיין אין עדכונים.</p>}
            {latestUpdates.map((update) => (
              <Link
                key={update.id}
                href={`/client/properties/${update.property.id}`}
                className="block rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <p className="font-medium">{update.property.title}</p>
                <p className="text-muted-foreground">{update.message}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" /> מסמכים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documentsWithUrls.length === 0 && <p className="text-sm text-muted-foreground">עדיין לא שותפו מסמכים.</p>}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> עדכונים ראשונים
            </span>
            <Link href="/client/updates" className="text-sm font-normal text-primary hover:underline">
              כל העדכונים
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentNotifications.length === 0 && <p className="text-sm text-muted-foreground">עדיין אין עדכונים.</p>}
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-md border p-2 text-sm ${!notification.isRead ? "border-primary/40 bg-primary/5" : ""}`}
            >
              <p>{notification.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
