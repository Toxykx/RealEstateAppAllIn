import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyCard } from "@/components/property/property-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicProperties } from "@/lib/properties";
import { Search, Home } from "lucide-react";

export default async function HomePage() {
  const properties = await getPublicProperties();
  const featured = properties.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-background to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-32">
            <p className="text-xs font-medium tracking-[0.35em] text-primary">
              נדל״ן יוקרתי · ליווי אישי מלא
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-6xl">
              מוצאים את הבית הבא, או מוכרים בביטחון מלא
            </h1>
            <div className="mx-auto mt-6 h-px w-16 bg-primary/50" />
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground sm:text-lg">
              ALL IN Real Estate מחברת בין קונים ומוכרים למתווכים מובחרים שמלווים כל שלב
              בעסקה — מהצגת הנכס ועד לחתימה על החוזה.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/properties" className={buttonVariants({ size: "lg", className: "tracking-wide" })}>
                <Search className="me-1 h-4 w-4" /> חיפוש נכסים
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ size: "lg", variant: "outline", className: "tracking-wide" })}
              >
                דברו עם מתווך
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <h2 className="font-serif text-2xl text-foreground sm:text-3xl">נכסים מומלצים</h2>
            <Link href="/properties" className="text-sm font-medium tracking-wide text-primary hover:underline">
              לכל הנכסים
            </Link>
          </div>
          {featured.length === 0 ? (
            <EmptyState icon={Home} message="עדיין אין נכסים מפורסמים" description="בקרו שוב בקרוב." />
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
