import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";
import { Plus, UserPlus, Building, Users, KeyRound, MessageSquareText } from "lucide-react";
import { prisma, withDbRetry } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { getAgentStats } from "@/lib/stats";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { QuickActions } from "@/components/quick-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { formatDateTime, LISTING_STATUS_LABELS } from "@/lib/format";

export default async function AgentDashboardPage() {
  const user = await requireUser(["AGENT", "MANAGER"]);
  const scope = agentScope(user, "agentId");
  const clientScope = agentScope(user, "managingAgentId");
  const today = new Date();

  const [propertyCount, clientCount, recentUpdates, upcomingVisits] = await withDbRetry(() =>
    Promise.all([
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
    ]),
  );

  const [todayVisits, activeProperties, keysHeld, weeklyStats, ownActivity] = await withDbRetry(() =>
    Promise.all([
      prisma.visit.findMany({
        where: { property: scope, status: "SCHEDULED", scheduledAt: { gte: startOfDay(today), lte: endOfDay(today) } },
        orderBy: { scheduledAt: "asc" },
        include: { property: { select: { title: true, id: true } } },
      }),
      prisma.property.findMany({
        where: { ...scope, listingStatus: { in: ["AVAILABLE", "IN_PROGRESS"] } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, title: true, city: true, listingStatus: true },
      }),
      prisma.property.findMany({
        where: { keyHolderId: user.id, keyStatus: "WITH_AGENT" },
        select: { id: true, title: true, keyLastTakenAt: true },
      }),
      getAgentStats(user.id, "week"),
      prisma.activityLog.findMany({
        where: { agentId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { property: { select: { title: true } } },
      }),
    ]),
  );

  const quickActions = [
    { label: "הוספת נכס", href: "/agent/properties/new", icon: Plus },
    { label: "לקוח חדש", href: "/agent/clients/new", icon: UserPlus },
    { label: "כל הנכסים", href: "/agent/properties", icon: Building },
    { label: "כל הלקוחות", href: "/agent/clients", icon: Users },
  ];

  const weeklyStatRows = [
    { label: "ביקורים", value: weeklyStats.visits },
    { label: "פגישות", value: weeklyStats.meetings },
    { label: "שיחות", value: weeklyStats.calls },
    { label: "נכסים שנוספו", value: weeklyStats.propertiesAdded },
    { label: "עדכוני ציר זמן", value: weeklyStats.timelineUpdates },
    { label: "עסקאות שנסגרו", value: weeklyStats.closedDeals },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold">שלום {user.name?.split(" ")[0]}</h1>
      </FadeIn>

      <FadeIn delay={0.05}>
        <QuickActions actions={quickActions} />
      </FadeIn>

      <StaggerList className="grid gap-4 sm:grid-cols-2">
        <StaggerItem>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {user.role === "MANAGER" ? "סה״כ נכסים" : "הנכסים שלי"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              <AnimatedNumber value={propertyCount} />
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {user.role === "MANAGER" ? "סה״כ לקוחות" : "הלקוחות שלי"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              <AnimatedNumber value={clientCount} />
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>

      <FadeIn delay={0.1} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">לוח הזמנים של היום</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayVisits.length === 0 && (
              <EmptyState icon={Building} message="אין סיורים מתוכננים להיום." />
            )}
            {todayVisits.map((visit) => (
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ביקורים קרובים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingVisits.length === 0 && (
              <EmptyState icon={Building} message="אין ביקורים מתוכננים." />
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
      </FadeIn>

      <FadeIn delay={0.15} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">הנכסים הפעילים שלי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeProperties.length === 0 && (
              <EmptyState icon={Building} message="אין נכסים פעילים כרגע." actionLabel="הוספת נכס" actionHref="/agent/properties/new" />
            )}
            {activeProperties.map((property) => (
              <Link
                key={property.id}
                href={`/agent/properties/${property.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-xs text-muted-foreground">{property.city}</p>
                </div>
                <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">מפתחות אצלי ({keysHeld.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {keysHeld.length === 0 && <EmptyState icon={KeyRound} message="אין מפתחות אצלך כרגע" compact />}
            {keysHeld.map((property) => (
              <Link
                key={property.id}
                href={`/agent/properties/${property.id}`}
                className="block rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                {property.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2} className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">סטטיסטיקה שבועית</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {weeklyStatRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-heading text-primary">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">עדכונים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUpdates.length === 0 && (
              <EmptyState icon={MessageSquareText} message="עדיין לא פורסמו עדכונים" compact />
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
            <CardTitle className="text-lg">הפעילות שלי</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogList logs={ownActivity} showProperty />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
