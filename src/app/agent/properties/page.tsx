import Link from "next/link";
import { Plus, Building, Search, X } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    page?: string;
    city?: string;
    street?: string;
    priceMin?: string;
    priceMax?: string;
    propertyType?: string;
    listingStatus?: string;
    agentId?: string;
  }>;
}) {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const params = await searchParams;

  const sort: SortField = SORTABLE_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "title";
  const dir = params.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(params.page) || 1);

  const { city, street, priceMin, priceMax } = params;
  const propertyType = params.propertyType && params.propertyType !== "all" ? params.propertyType : undefined;
  const listingStatus = params.listingStatus && params.listingStatus !== "all" ? params.listingStatus : undefined;
  // Only a manager can usefully filter by agent — a regular agent only ever
  // sees their own properties via agentScope regardless.
  const agentId =
    user.role === "MANAGER" && params.agentId && params.agentId !== "all" ? params.agentId : undefined;
  const hasFilters = Boolean(city || street || priceMin || priceMax || propertyType || listingStatus || agentId);

  const where: Prisma.PropertyWhereInput = {
    ...agentScope(user, "agentId"),
    ...(agentId ? { agentId } : {}),
    ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    ...(street ? { addressLine: { contains: street, mode: "insensitive" } } : {}),
    ...(propertyType ? { propertyType: propertyType as Prisma.EnumPropertyTypeFilter["equals"] } : {}),
    ...(listingStatus ? { listingStatus: listingStatus as Prisma.EnumListingStatusFilter["equals"] } : {}),
    ...(priceMin || priceMax
      ? {
          price: {
            ...(priceMin ? { gte: Number(priceMin) } : {}),
            ...(priceMax ? { lte: Number(priceMax) } : {}),
          },
        }
      : {}),
  };

  const [total, properties, agents] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: { ownerClient: { select: { name: true } }, agent: { select: { name: true } } },
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    user.role === "MANAGER"
      ? prisma.user.findMany({
          where: { role: { in: ["AGENT", "MANAGER"] } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
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

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="city">עיר</Label>
              <Input id="city" name="city" defaultValue={city ?? ""} placeholder="לדוגמה: תל אביב" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">רחוב</Label>
              <Input id="street" name="street" defaultValue={street ?? ""} placeholder="לדוגמה: הרצל" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMin">מחיר מינימלי</Label>
              <Input id="priceMin" name="priceMin" type="number" min={0} defaultValue={priceMin ?? ""} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">מחיר מקסימלי</Label>
              <Input id="priceMax" name="priceMax" type="number" min={0} defaultValue={priceMax ?? ""} placeholder="ללא הגבלה" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">סוג נכס</Label>
              <Select
                name="propertyType"
                defaultValue={propertyType ?? "all"}
                items={[{ value: "all", label: "הכל" }, ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }))]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listingStatus">סטטוס</Label>
              <Select
                name="listingStatus"
                defaultValue={listingStatus ?? "all"}
                items={[{ value: "all", label: "הכל" }, ...Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  {Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {user.role === "MANAGER" && (
              <div className="space-y-2">
                <Label htmlFor="agentId">מתווך</Label>
                <Select
                  name="agentId"
                  defaultValue={agentId ?? "all"}
                  items={[{ value: "all", label: "כל המתווכים" }, ...agents.map((a) => ({ value: a.id, label: a.name }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל המתווכים</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
              <Button type="submit" className="flex-1 sm:flex-initial">
                <Search className="h-4 w-4" /> סינון
              </Button>
              {hasFilters && (
                <Link href="/agent/properties" className={buttonVariants({ variant: "ghost" })}>
                  <X className="h-4 w-4" /> נקה סינון
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {total === 0 ? (
        hasFilters ? (
          <EmptyState icon={Search} message="לא נמצאו נכסים תואמים" description="נסו לשנות את הסינון." />
        ) : (
          <EmptyState
            icon={Building}
            message="עדיין אין נכסים"
            description="הוסיפו את הנכס הראשון כדי להתחיל לעקוב אחריו כאן."
            actionLabel="הוספת נכס"
            actionHref="/agent/properties/new"
          />
        )
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
