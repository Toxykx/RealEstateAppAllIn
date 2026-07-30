import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
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
const SORTABLE_FIELDS = ["name", "email", "role"] as const;
type SortField = (typeof SORTABLE_FIELDS)[number];

export default async function ManagerAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; page?: string }>;
}) {
  await requireUser(["MANAGER"]);
  const params = await searchParams;

  const sort: SortField = SORTABLE_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "name";
  const dir = params.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(params.page) || 1);
  const where: Prisma.UserWhereInput = { role: { in: ["AGENT", "MANAGER"] } };
  const orderBy: Prisma.UserOrderByWithRelationInput = { [sort]: dir };

  const [total, agents] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { _count: { select: { agentProperties: true, managedClients: true } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מתווכים ומנהלים</h1>
        <Link href="/manager/agents/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> מתווך חדש
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={UserCog}
          message="עדיין אין מתווכים"
          description="הוסיפו את המתווך הראשון לצוות."
          actionLabel="מתווך חדש"
          actionHref="/manager/agents/new"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="שם" sortKey="name" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="אימייל" sortKey="email" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="תפקיד" sortKey="role" currentSort={sort} currentDir={dir} searchParams={params} />
                  <TableHead>לקוחות</TableHead>
                  <TableHead>נכסים</TableHead>
                  <TableHead>סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <Link href={`/manager/agents/${agent.id}`} className="font-medium hover:underline">
                        {agent.name}
                      </Link>
                    </TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>
                      <Badge variant={agent.role === "MANAGER" ? "default" : "outline"}>
                        {agent.role === "MANAGER" ? "מנהל" : "מתווך"}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent._count.managedClients}</TableCell>
                    <TableCell>{agent._count.agentProperties}</TableCell>
                    <TableCell>
                      <Badge variant={agent.isActive ? "secondary" : "outline"}>
                        {agent.isActive ? "פעיל" : "לא פעיל"}
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
