import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { getDistinctCities, getPublicProperties } from "@/lib/properties";
import { PropertyCard } from "@/components/property/property-card";
import { FavoriteButton } from "@/components/property/favorite-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

export default async function ClientSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; propertyType?: string }>;
}) {
  const user = await requireUser(["CLIENT"]);
  const params = await searchParams;

  const [properties, cities, favorites] = await Promise.all([
    getPublicProperties(params),
    getDistinctCities(),
    prisma.favorite.findMany({ where: { clientId: user.id }, select: { propertyId: true } }),
  ]);
  const favoritedIds = new Set(favorites.map((f) => f.propertyId));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">חיפוש נכסים</h1>

      <form method="get" className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-4">
        <Input name="q" placeholder="חיפוש לפי כותרת או כתובת" defaultValue={params.q} />
        <Select
          name="city"
          defaultValue={params.city || "all"}
          items={[{ value: "all", label: "כל הערים" }, ...cities.map((city) => ({ value: city, label: city }))]}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="עיר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הערים</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          name="propertyType"
          defaultValue={params.propertyType || "all"}
          items={[
            { value: "all", label: "כל הסוגים" },
            ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="סוג נכס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">החלת סינון</Button>
      </form>

      {properties.length === 0 ? (
        <p className="text-muted-foreground">לא נמצאו נכסים התואמים את החיפוש.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              actions={
                <FavoriteButton propertyId={property.id} isFavorited={favoritedIds.has(property.id)} />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
