import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCardSkeletonGrid } from "@/components/ui/skeletons/property-card-skeleton";

export default function PublicCatalogLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-24 w-full" />
          <PropertyCardSkeletonGrid count={9} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
