import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDistinctCities, getPublicProperties } from "@/lib/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    city?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const [properties, cities] = await Promise.all([
    getPublicProperties({
      q: params.q,
      city: params.city,
      propertyType: params.propertyType,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    }),
    getDistinctCities(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">קטלוג נכסים</h1>

          <form
            method="get"
            className="mb-8 grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <Input
              name="q"
              placeholder="חיפוש לפי כותרת או כתובת"
              defaultValue={params.q}
              className="lg:col-span-2"
            />
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
            <div className="flex gap-2">
              <Input name="minPrice" type="number" placeholder="מחיר מינימלי" defaultValue={params.minPrice} />
              <Input name="maxPrice" type="number" placeholder="מחיר מקסימלי" defaultValue={params.maxPrice} />
            </div>
            <Button type="submit" className="lg:col-span-5">
              החלת סינון
            </Button>
          </form>

          {properties.length === 0 ? (
            <p className="text-muted-foreground">לא נמצאו נכסים התואמים את החיפוש.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
