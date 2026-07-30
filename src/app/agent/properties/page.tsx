import Link from "next/link";
import { Plus, Building } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/format";

const PAGE_SIZE = 10;
const SORTABLE_FIELDS = ["title", "city", "price", "listingStatus"] as const;
type SortField = (typeof SORTABLE_FIELDS)[number];

export default async function AgentPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; page?: string }>;
}) {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const params = await searchParams;

  const sort: SortField = SORTABLE_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "title";
  const dir = params.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(params.page) || 1);

  const [total, properties] = await Promise.all([
    prisma.property.count({ where: agentScope(user, "agentId") }),
    prisma.property.findMany({
      where: agentScope(user, "agentId"),
      include: { ownerClient: { select: { name: true } }, agent: { select: { name: true } } },
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">נכסים</h1>
        <Link href="/agent/properties/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> הוספת נכס
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Building}
          message="עדיין אין נכסים"
          description="הוסיפו את הנכס הראשון כדי להתחיל לעקוב אחריו כאן."
          actionLabel="הוספת נכס"
          actionHref="/agent/properties/new"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="כותרת" sortKey="title" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="עיר" sortKey="city" currentSort={sort} currentDir={dir} searchParams={params} />
                  <TableHead>סוג</TableHead>
                  <SortableTableHead label="מחיר" sortKey="price" currentSort={sort} currentDir={dir} searchParams={params} />
                  <TableHead>בעלים</TableHead>
                  {user.role === "MANAGER" && <TableHead>מתווך</TableHead>}
                  <SortableTableHead label="סטטוס" sortKey="listingStatus" currentSort={sort} currentDir={dir} searchParams={params} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Link
                        href={`/agent/properties/${property.id}`}
                        className="font-medium hover:underline"
                      >
                        {property.title}
                      </Link>
                    </TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>{PROPERTY_TYPE_LABELS[property.propertyType]}</TableCell>
                    <TableCell>{formatPrice(property.price.toString(), property.currency)}</TableCell>
                    <TableCell>{property.ownerClient?.name ?? "—"}</TableCell>
                    {user.role === "MANAGER" && <TableCell>{property.agent.name}</TableCell>}
                    <TableCell>
                      <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination page={page} totalPages={totalPages} searchParams={params} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
