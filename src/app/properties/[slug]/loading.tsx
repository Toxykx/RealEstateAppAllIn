import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GallerySkeleton } from "@/components/ui/skeletons/gallery-skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <GallerySkeleton />
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-16" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-56" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
