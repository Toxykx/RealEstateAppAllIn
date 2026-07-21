import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateClient } from "@/lib/actions/clients";
import { ActionForm } from "@/components/action-form";
import { CreatedToast } from "@/components/created-toast";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, CalendarDays, Home } from "lucide-react";
import { formatPrice, formatDateTime, LISTING_STATUS_LABELS } from "@/lib/format";

const VISIT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "מתוכנן",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(["AGENT", "MANAGER"]);

  const client = await prisma.user.findUnique({
    where: { id, role: "CLIENT" },
    include: {
      ownedProperties: { include: { images: { where: { isCover: true }, take: 1 } } },
    },
  });

  if (!client) notFound();
  if (user.role === "AGENT" && client.managingAgentId !== user.id) notFound();

  const [favorites, visits, activityLogs] = await Promise.all([
    prisma.favorite.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      include: { property: { select: { id: true, title: true, city: true, price: true, currency: true, listingStatus: true } } },
    }),
    prisma.visit.findMany({
      where: { clientId: client.id },
      orderBy: { scheduledAt: "desc" },
      include: { property: { select: { id: true, title: true } } },
    }),
    prisma.activityLog.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { agent: { select: { name: true } }, property: { select: { title: true } } },
    }),
  ]);

  const boundUpdate = updateClient.bind(null, client.id);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <CreatedToast message="הלקוח נוצר בהצלחה" />
      </Suspense>
      <div>
        <Link href="/agent/clients" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה ללקוחות
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{client.name}</h1>
        <p className="text-muted-foreground">{client.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">נכסים בבעלות</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-heading text-primary">{client.ownedProperties.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">נכסים מועדפים</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-heading text-primary">{favorites.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">ביקורים</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-heading text-primary">{visits.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">פעולות תיעוד</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-heading text-primary">{activityLogs.length}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">פרטי הלקוח</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={boundUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input id="name" name="name" defaultValue={client.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" name="phone" defaultValue={client.phone ?? ""} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isActive" name="isActive" defaultChecked={client.isActive} />
                <Label htmlFor="isActive">חשבון פעיל</Label>
              </div>
              <Button type="submit">שמירת שינויים</Button>
            </ActionForm>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">נכסים ({client.ownedProperties.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.ownedProperties.length === 0 && (
              <EmptyState
                icon={Home}
                message="עדיין לא הוקצו נכסים ללקוח זה."
                actionLabel="הוספת נכס"
                actionHref="/agent/properties/new"
              />
            )}
            {client.ownedProperties.map((property) => (
              <Link
                key={property.id}
                href={`/agent/properties/${property.id}`}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.city} · {formatPrice(property.price.toString(), property.currency)}
                  </p>
                </div>
                <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-4 w-4" /> נכסים מועדפים ({favorites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {favorites.length === 0 && <EmptyState icon={Heart} message="הלקוח עדיין לא סימן נכסים כמועדפים." />}
            {favorites.map((favorite) => (
              <Link
                key={favorite.id}
                href={`/agent/properties/${favorite.property.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{favorite.property.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {favorite.property.city} ·{" "}
                    {formatPrice(favorite.property.price.toString(), favorite.property.currency)}
                  </p>
                </div>
                <Badge variant="secondary">{LISTING_STATUS_LABELS[favorite.property.listingStatus]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-4 w-4" /> ביקורים ({visits.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visits.length === 0 && <EmptyState icon={CalendarDays} message="עדיין לא נקבעו ביקורים ללקוח זה." />}
            {visits.map((visit) => (
              <Link
                key={visit.id}
                href={`/agent/properties/${visit.property.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{visit.property.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(visit.scheduledAt)}</p>
                </div>
                <Badge variant="outline">{VISIT_STATUS_LABELS[visit.status] ?? visit.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">היסטוריית תקשורת ופעילות</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogList logs={activityLogs} showProperty />
        </CardContent>
      </Card>
    </div>
  );
}
