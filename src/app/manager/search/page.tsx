import Link from "next/link";
import { Search, KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { getAgentPerformanceComparison } from "@/lib/stats";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KEY_STATUS_LABELS, LISTING_STATUS_LABELS, formatDateTime } from "@/lib/format";

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function ManagerSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; agent?: string }>;
}) {
  await requireUser(["MANAGER"]);
  const { property: propertyQuery, agent: agentQuery } = await searchParams;

  const properties = propertyQuery
    ? await prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: propertyQuery, mode: "insensitive" } },
            { city: { contains: propertyQuery, mode: "insensitive" } },
            { addressLine: { contains: propertyQuery, mode: "insensitive" } },
          ],
        },
        include: {
          agent: { select: { name: true } },
          _count: { select: { documents: true, visits: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const [agents, agentWeeklyPerformance] = agentQuery
    ? await Promise.all([
        prisma.user.findMany({
          where: { role: { in: ["AGENT", "MANAGER"] }, name: { contains: agentQuery, mode: "insensitive" } },
          include: {
            _count: { select: { agentProperties: true, managedClients: true, keysHeld: true } },
          },
          orderBy: { name: "asc" },
          take: 20,
        }),
        getAgentPerformanceComparison("week"),
      ])
    : [[], []];

  const performanceByAgentId = new Map(agentWeeklyPerformance.map((row) => [row.agentId, row]));

  const keysOutsideOffice = await prisma.property.findMany({
    where: { keyStatus: { not: "IN_OFFICE" } },
    include: { keyHolder: { select: { name: true } } },
    orderBy: { keyLastTakenAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">חיפוש</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">חיפוש נכס</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex gap-2">
              <Input name="property" defaultValue={propertyQuery ?? ""} placeholder="כותרת, עיר או כתובת" />
              <Button type="submit" size="icon" aria-label="חיפוש">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <ul className="space-y-2">
              {properties.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/agent/properties/${property.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 text-sm hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{property.title}</span>
                      <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
                    </div>
                    <p className="text-muted-foreground">{property.city}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>מתווך: {property.agent.name}</span>
                      <span>·</span>
                      <span>מפתח: {KEY_STATUS_LABELS[property.keyStatus]}</span>
                      <span>·</span>
                      <span>{property._count.documents} מסמכים</span>
                      <span>·</span>
                      <span>{property._count.visits} ביקורים</span>
                    </div>
                  </Link>
                </li>
              ))}
              {propertyQuery && properties.length === 0 && (
                <p className="text-sm text-muted-foreground">לא נמצאו נכסים תואמים.</p>
              )}
              {!propertyQuery && (
                <p className="text-sm text-muted-foreground">הזינו חיפוש כדי להציג נכסים.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">חיפוש מתווך</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex gap-2">
              <Input name="agent" defaultValue={agentQuery ?? ""} placeholder="שם המתווך" />
              <Button type="submit" size="icon" aria-label="חיפוש">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <ul className="space-y-2">
              {agents.map((agent) => (
                <li key={agent.id}>
                  <Link
                    href={`/manager/agents/${agent.id}`}
                    className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-muted-foreground">
                        {agent._count.managedClients} לקוחות · {agent._count.agentProperties} נכסים ·{" "}
                        {agent._count.keysHeld} מפתחות אצלו
                      </p>
                      {performanceByAgentId.has(agent.id) && (
                        <p className="text-xs text-muted-foreground">
                          השבוע: {performanceByAgentId.get(agent.id)?.visits} ביקורים ·{" "}
                          {performanceByAgentId.get(agent.id)?.calls} שיחות ·{" "}
                          {performanceByAgentId.get(agent.id)?.closedDeals} עסקאות
                        </p>
                      )}
                    </div>
                    <Badge variant={agent.role === "MANAGER" ? "default" : "outline"}>
                      {agent.role === "MANAGER" ? "מנהל" : "מתווך"}
                    </Badge>
                  </Link>
                </li>
              ))}
              {agentQuery && agents.length === 0 && (
                <p className="text-sm text-muted-foreground">לא נמצאו מתווכים תואמים.</p>
              )}
              {!agentQuery && (
                <p className="text-sm text-muted-foreground">הזינו חיפוש כדי להציג מתווכים.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-4 w-4" /> מפתחות מחוץ למשרד ({keysOutsideOffice.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {keysOutsideOffice.length === 0 ? (
            <EmptyState icon={KeyRound} message="כל המפתחות נמצאים במשרד." />
          ) : (
            <ul className="space-y-2">
              {keysOutsideOffice.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/agent/properties/${property.id}`}
                    className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.keyHolder ? `אצל: ${property.keyHolder.name}` : "—"}
                        {property.keyLastTakenAt && ` · לפני ${daysSince(property.keyLastTakenAt)} ימים (${formatDateTime(property.keyLastTakenAt)})`}
                      </p>
                    </div>
                    <Badge variant="secondary">{KEY_STATUS_LABELS[property.keyStatus]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
