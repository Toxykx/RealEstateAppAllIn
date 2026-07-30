import Link from "next/link";
import { Plus, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
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

const PAGE_SIZE = 10;
const SORTABLE_FIELDS = ["name", "email", "properties"] as const;
type SortField = (typeof SORTABLE_FIELDS)[number];

export default async function AgentClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; page?: string }>;
}) {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const params = await searchParams;

  const sort: SortField = SORTABLE_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "name";
  const dir = params.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(params.page) || 1);

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sort === "properties" ? { ownedProperties: { _count: dir } } : { [sort]: dir };
  const where = { role: "CLIENT" as const, ...agentScope(user, "managingAgentId") };

  const [total, clients] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { ownedProperties: true } },
        managingAgent: { select: { name: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">לקוחות</h1>
        <Link href="/agent/clients/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> לקוח חדש
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Users}
          message="עדיין אין לקוחות"
          description="הוסיפו את הלקוח הראשון כדי להתחיל לנהל את הנכסים שלו כאן."
          actionLabel="לקוח חדש"
          actionHref="/agent/clients/new"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="שם" sortKey="name" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="אימייל" sortKey="email" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="נכסים" sortKey="properties" currentSort={sort} currentDir={dir} searchParams={params} />
                  {user.role === "MANAGER" && <TableHead>מתווך</TableHead>}
                  <TableHead>סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link href={`/agent/clients/${client.id}`} className="font-medium hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client._count.ownedProperties}</TableCell>
                    {user.role === "MANAGER" && (
                      <TableCell>{client.managingAgent?.name ?? "—"}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant={client.isActive ? "secondary" : "outline"}>
                        {client.isActive ? "פעיל" : "לא פעיל"}
                      </Badge>
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
