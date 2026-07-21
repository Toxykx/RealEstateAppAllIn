import Image from "next/image";
import { notFound } from "next/navigation";
import { Bath, BedDouble, MapPin, Phone, Ruler } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPropertyBySlug } from "@/lib/properties";
import { logActivity } from "@/lib/activity-log";
import { formatPrice, LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/format";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || !["AVAILABLE", "IN_PROGRESS"].includes(property.listingStatus)) {
    notFound();
  }

  await logActivity({
    activityType: "PROPERTY_VIEWED",
    description: "הנכס נצפה בקטלוג הציבורי.",
    propertyId: property.id,
    agentId: property.agentId,
  }).catch(() => {});

  const gallery = property.images.length > 0 ? property.images : [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6">
            <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{property.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {property.addressLine}, {property.city}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gallery.length === 0 ? (
                  <div className="col-span-full flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    אין תמונות עדיין
                  </div>
                ) : (
                  gallery.map((image, i) => (
                    <div
                      key={image.id}
                      className={`relative overflow-hidden rounded-lg bg-muted ${
                        i === 0 ? "col-span-2 aspect-video sm:col-span-3" : "aspect-square"
                      }`}
                    >
                      <Image src={image.url} alt={property.title} fill className="object-cover" />
                    </div>
                  ))
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">פרטים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-2xl font-semibold text-primary">
                    {formatPrice(property.price, property.currency)}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
                    </Badge>
                    {property.bedrooms != null && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {property.bedrooms} חדרים
                      </span>
                    )}
                    {property.bathrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {property.bathrooms} חדרי רחצה
                      </span>
                    )}
                    {property.areaSqm != null && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" /> {property.areaSqm} m²
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">מתווך הנכס</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium">{property.agent.name}</p>
                  {property.agent.phone && (
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {property.agent.phone}
                    </p>
                  )}
                  {property.agent.phone && (
                    <WhatsAppButton
                      phone={property.agent.phone}
                      propertyReference={`${property.title}, ${property.city}`}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">מעוניינים בנכס הזה?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm propertyId={property.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
