import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/format";

export type PropertyCardData = {
  slug: string;
  title: string;
  city: string;
  price: number | string;
  currency: string;
  propertyType: string;
  listingStatus: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  coverImageUrl: string | null;
};

export function PropertyCard({
  property,
  href,
  actions,
}: {
  property: PropertyCardData;
  href?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Link href={href ?? `/properties/${property.slug}`}>
      <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {property.coverImageUrl ? (
            <Image
              src={property.coverImageUrl}
              alt={property.title}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              אין תמונה
            </div>
          )}
          <Badge className="absolute start-3 top-3" variant="secondary">
            {LISTING_STATUS_LABELS[property.listingStatus] ?? property.listingStatus}
          </Badge>
          {actions}
        </div>
        <CardContent className="space-y-2 pb-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{property.title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {property.city}
          </p>
          <p className="text-lg font-semibold text-primary">
            {formatPrice(property.price, property.currency)}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {property.bathrooms}
              </span>
            )}
            {property.areaSqm != null && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" /> {property.areaSqm} m²
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
