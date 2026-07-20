import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateClient } from "@/lib/actions/clients";
import { ActionForm } from "@/components/action-form";
import { CreatedToast } from "@/components/created-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, LISTING_STATUS_LABELS } from "@/lib/format";

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
              <p className="text-sm text-muted-foreground">
                עדיין לא הוקצו נכסים.{" "}
                <Link href="/agent/properties/new" className="text-primary hover:underline">
                  הוספת נכס
                </Link>{" "}
                והקצו אותו ללקוח זה.
              </p>
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
    </div>
  );
}
