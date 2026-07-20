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

export default async function AgentClientsPage() {
  const user = await requireUser(["AGENT", "MANAGER"]);

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", ...agentScope(user, "managingAgentId") },
    include: {
      _count: { select: { ownedProperties: true } },
      managingAgent: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">לקוחות</h1>
        <Link href="/agent/clients/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> לקוח חדש
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>נכסים</TableHead>
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
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    עדיין אין לקוחות.
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
