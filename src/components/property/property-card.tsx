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
      <Card className="group h-full overflow-hidden border-border/70 py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_0_1px_var(--color-primary)/10,0_16px_40px_-16px_rgba(0,0,0,0.7)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {property.coverImageUrl ? (
            <Image
              src={property.coverImageUrl}
              alt={property.title}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              אין תמונה
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge className="absolute start-3 top-3" variant="secondary">
            {LISTING_STATUS_LABELS[property.listingStatus] ?? property.listingStatus}
          </Badge>
          {actions}
          <span className="absolute bottom-3 start-3 text-[10px] font-medium tracking-[0.2em] text-white/80 uppercase">
            {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
          </span>
        </div>
        <CardContent className="space-y-3 pb-6">
          <div>
            <h3 className="font-heading text-lg leading-tight text-foreground">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {property.city}
            </p>
          </div>
          <p className="font-heading text-xl text-primary">
            {formatPrice(property.price, property.currency)}
          </p>
          <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
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
