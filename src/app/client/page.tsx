import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_STEPS, LISTING_STATUS_LABELS, dealStageIndex, formatPrice } from "@/lib/format";

export default async function MyPropertiesPage() {
  const user = await requireUser(["CLIENT"]);

  const properties = await prisma.property.findMany({
    where: { ownerClientId: user.id },
    include: { images: { where: { isCover: true }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">הנכסים שלי</h1>

      {properties.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            עדיין לא הוקצו לך נכסים. הסוכן שלך יוסיף נכס כאן ברגע שיהיה מוכן.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {properties.map((property) => {
          const stageIndex = dealStageIndex(property.dealStage);
          const cover = property.images[0]?.url;
          return (
            <Link key={property.id} href={`/client/properties/${property.id}`}>
              <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9] w-full bg-muted">
                  {cover ? (
                    <Image src={cover} alt={property.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      אין תמונה
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 pb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{property.title}</h2>
                    <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{property.city}</p>
                  <p className="font-semibold text-primary">
                    {formatPrice(property.price.toString(), property.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    שלב נוכחי: {DEAL_STAGE_STEPS[stageIndex]?.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
