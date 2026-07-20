import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyCard } from "@/components/property/property-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicProperties } from "@/lib/properties";
import { Search } from "lucide-react";

export default async function HomePage() {
  const properties = await getPublicProperties();
  const featured = properties.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              מוצאים את הבית הבא, או מוכרים בביטחון
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
              אופק נכסים מחברת בין קונים ומוכרים למתווכים מסורים שמלווים כל שלב בעסקה — מהצגת
              הנכס ועד לחתימה על החוזה.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/properties" className={buttonVariants({ size: "lg" })}>
                <Search className="me-1 h-4 w-4" /> חיפוש נכסים
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                דברו עם מתווך
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">נכסים מומלצים</h2>
            <Link href="/properties" className="text-sm font-medium text-primary hover:underline">
              לכל הנכסים
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="text-muted-foreground">
              עדיין אין נכסים מפורסמים — בקרו שוב בקרוב.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
