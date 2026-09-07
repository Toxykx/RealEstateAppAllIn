import Link from "next/link";
import { KeyRound, RotateCcwKey } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { takeKey, returnKey, setKeyStatus } from "@/lib/actions/keys";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { KEY_STATUS_LABELS } from "@/lib/format";

const PAGE_SIZE = 15;
const SORTABLE_FIELDS = ["title", "city", "keyStatus"] as const;
type SortField = (typeof SORTABLE_FIELDS)[number];

export default async function KeysBoardPage({
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
  const orderBy: Prisma.PropertyOrderByWithRelationInput = { [sort]: dir };

  // No agentScope here on purpose — every agent needs to see every
  // property's key status, not just their own, so keys can be shared.
  const [total, properties] = await Promise.all([
    prisma.property.count(),
    prisma.property.findMany({
      include: {
        agent: { select: { name: true } },
        keyHolder: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">לוח מפתחות</h1>
        <p className="text-sm text-muted-foreground">
          כל המפתחות במשרד — ניתן לקחת מפתח לכל נכס, ולהחזיר רק מפתח שנמצא אצלכם.
        </p>
      </div>

      {total === 0 ? (
        <EmptyState icon={KeyRound} message="עדיין אין נכסים במערכת" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="כותרת" sortKey="title" currentSort={sort} currentDir={dir} searchParams={params} />
                  <SortableTableHead label="עיר" sortKey="city" currentSort={sort} currentDir={dir} searchParams={params} className="hidden sm:table-cell" />
                  <TableHead className="hidden md:table-cell">כתובת</TableHead>
                  <TableHead className="hidden md:table-cell">מתווך אחראי</TableHead>
                  <SortableTableHead label="סטטוס מפתח" sortKey="keyStatus" currentSort={sort} currentDir={dir} searchParams={params} />
                  <TableHead>פעולה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Link href={`/agent/properties/${property.id}`} className="font-medium hover:underline">
                        {property.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{property.city}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{property.addressLine}</TableCell>
                    <TableCell className="hidden md:table-cell">{property.agent.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{KEY_STATUS_LABELS[property.keyStatus]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {property.keyStatus === "IN_OFFICE" && (
                          <ActionForm action={takeKey.bind(null, property.id)}>
                            <SubmitButton size="sm" pendingLabel="לוקח...">
                              קח מפתח
                            </SubmitButton>
                          </ActionForm>
                        )}
                        {property.keyStatus === "WITH_AGENT" && property.keyHolderId === user.id && (
                          <ActionForm action={returnKey.bind(null, property.id)}>
                            <SubmitButton size="sm" variant="outline" pendingLabel="מחזיר...">
                              החזר מפתח
                            </SubmitButton>
                          </ActionForm>
                        )}
                        {property.keyStatus === "WITH_AGENT" && property.keyHolderId !== user.id && (
                          <span className="text-sm text-muted-foreground">
                            המפתח אצל {property.keyHolder?.name ?? "מתווך אחר"}
                          </span>
                        )}

                        {user.role === "MANAGER" && property.keyStatus !== "LOST" && (
                          <ActionForm action={setKeyStatus.bind(null, property.id)}>
                            <input type="hidden" name="keyStatus" value="LOST" />
                            <SubmitButton
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              aria-label="סימון מפתח כאבוד"
                            >
                              <KeyRound className="h-4 w-4 rotate-[135deg]" />
                            </SubmitButton>
                          </ActionForm>
                        )}
                        {user.role === "MANAGER" && property.keyStatus === "LOST" && (
                          <ActionForm action={setKeyStatus.bind(null, property.id)}>
                            <input type="hidden" name="keyStatus" value="IN_OFFICE" />
                            <SubmitButton size="icon-sm" variant="ghost" aria-label="ביטול סימון אבוד">
                              <RotateCcwKey className="h-4 w-4" />
                            </SubmitButton>
                          </ActionForm>
                        )}
                      </div>
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
