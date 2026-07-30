import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Prev/next pagination for a searchParams-driven table. RTL-aware: "next"
 * (forward, higher page numbers) points left, "previous" points right,
 * matching the mirrored chevrons used elsewhere in the app.
 */
export function TablePagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
    );
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-2 py-3 text-sm text-muted-foreground">
      <span>
        עמוד {page} מתוך {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), page <= 1 && "pointer-events-none opacity-40")}
          aria-label="עמוד קודם"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            page >= totalPages && "pointer-events-none opacity-40",
          )}
          aria-label="עמוד הבא"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
