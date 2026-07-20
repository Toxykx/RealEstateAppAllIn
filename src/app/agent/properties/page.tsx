import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/format";

export default async function AgentPropertiesPage() {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const properties = await prisma.property.findMany({
    where: agentScope(user, "agentId"),
    include: { ownerClient: { select: { name: true } }, agent: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">נכסים</h1>
        <Link href="/agent/properties/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> הוספת נכס
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>עיר</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead>בעלים</TableHead>
                {user.role === "MANAGER" && <TableHead>מתווך</TableHead>}
                <TableHead>סטטוס</TableHead>
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
              {properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    עדיין אין נכסים.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
