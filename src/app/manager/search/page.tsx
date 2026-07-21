import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KEY_STATUS_LABELS, LISTING_STATUS_LABELS } from "@/lib/format";

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
        include: { agent: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const agents = agentQuery
    ? await prisma.user.findMany({
        where: { role: { in: ["AGENT", "MANAGER"] }, name: { contains: agentQuery, mode: "insensitive" } },
        include: { _count: { select: { agentProperties: true, managedClients: true } } },
        orderBy: { name: "asc" },
        take: 20,
      })
    : [];

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
                        {agent._count.managedClients} לקוחות · {agent._count.agentProperties} נכסים
                      </p>
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
    </div>
  );
}
