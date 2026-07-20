import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
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

export default async function ManagerAgentsPage() {
  await requireUser(["MANAGER"]);

  const agents = await prisma.user.findMany({
    where: { role: { in: ["AGENT", "MANAGER"] } },
    include: { _count: { select: { agentProperties: true, managedClients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">סוכנים ומנהלים</h1>
        <Link href="/manager/agents/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> סוכן חדש
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>תפקיד</TableHead>
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
                      {agent.role === "MANAGER" ? "מנהל" : "סוכן"}
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
        </CardContent>
      </Card>
    </div>
  );
}
