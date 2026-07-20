import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export default async function AgentDashboardPage() {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const scope = agentScope(user, "agentId");
  const clientScope = agentScope(user, "managingAgentId");

  const [propertyCount, clientCount, recentUpdates, upcomingVisits] = await Promise.all([
    prisma.property.count({ where: scope }),
    prisma.user.count({ where: { role: "CLIENT", ...clientScope } }),
    prisma.propertyUpdate.findMany({
      where: { property: scope },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { property: { select: { title: true, id: true } } },
    }),
    prisma.visit.findMany({
      where: { property: scope, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { property: { select: { title: true, id: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome back, {user.name?.split(" ")[0]}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user.role === "MANAGER" ? "Total properties" : "My properties"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{propertyCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user.role === "MANAGER" ? "Total clients" : "My clients"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{clientCount}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUpdates.length === 0 && (
              <p className="text-sm text-muted-foreground">No updates posted yet.</p>
            )}
            {recentUpdates.map((update) => (
              <Link
                key={update.id}
                href={`/agent/properties/${update.property.id}`}
                className="block rounded-md border p-3 text-sm hover:bg-muted/50"
              >
                <p className="font-medium">{update.property.title}</p>
                <p className="text-muted-foreground">{update.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(update.createdAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming visits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingVisits.length === 0 && (
              <p className="text-sm text-muted-foreground">No visits scheduled.</p>
            )}
            {upcomingVisits.map((visit) => (
              <Link
                key={visit.id}
                href={`/agent/properties/${visit.property.id}`}
                className="block rounded-md border p-3 text-sm hover:bg-muted/50"
              >
                <p className="font-medium">{visit.property.title}</p>
                <p className="text-muted-foreground">{formatDateTime(visit.scheduledAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
