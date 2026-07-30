import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * A sortable <TableHead>: clicking toggles asc/desc on `sortKey` via the
 * `sort`/`dir` search params, preserving any other params already on the URL
 * (e.g. pagination's `page` gets reset to 1 since the result set changes).
 */
export function SortableTableHead({
  label,
  sortKey,
  currentSort,
  currentDir,
  searchParams,
  className,
}: {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: "asc" | "desc";
  searchParams: Record<string, string | undefined>;
  className?: string;
}) {
  const active = currentSort === sortKey;
  const nextDir = active && currentDir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
  );
  params.set("sort", sortKey);
  params.set("dir", nextDir);
  params.delete("page");

  const Icon = active ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <Link
        href={`?${params.toString()}`}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </Link>
    </TableHead>
  );
}
