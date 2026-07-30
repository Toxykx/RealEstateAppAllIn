import Link from "next/link";
import {
  Building2,
  Home,
  KeyRound,
  Handshake,
  Users,
  UserCog,
  CalendarCheck,
  Users2,
  Phone,
  Plus,
  UserPlus,
  Building,
  Search,
} from "lucide-react";
import { prisma, withDbRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import {
  getManagerKpis,
  getPropertyDistribution,
  getAgentPerformanceComparison,
  getWeeklyActivitySeries,
  getMonthlyActivitySeries,
  getDailyBriefingCore,
} from "@/lib/stats";
import { getManagerAlerts } from "@/lib/alerts";
import { KpiCard } from "@/components/manager/kpi-card";
import { AlertsWidget } from "@/components/manager/alerts-widget";
import { DailyBriefing } from "@/components/manager/daily-briefing";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { QuickActions } from "@/components/quick-actions";
import { PropertyDistributionPie } from "@/components/charts/property-distribution-pie";
import { AgentPerformanceBar } from "@/components/charts/agent-performance-bar";
import { WeeklyActivityChart } from "@/components/charts/weekly-activity-chart";
import { MonthlyActivityChart } from "@/components/charts/monthly-activity-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import { LISTING_STATUS_LABELS } from "@/lib/format";

export default async function ManagerDashboardPage() {
  const user = await requireUser(["MANAGER"]);

  // Split into sequential batches (rather than one ~24-way Promise.all) to stay
  // comfortably under the Supabase pooler's connection limit for this request,
  // and retry each batch once if the pooler drops a burst of connections
  // (most common right after a fresh login).
  const [kpis, distribution, agentPerformance] = await withDbRetry(() =>
    Promise.all([getManagerKpis(), getPropertyDistribution(), getAgentPerformanceComparison("week")]),
  );

  const [weeklyActivity, monthlyActivity, briefingCore, alerts] = await withDbRetry(() =>
    Promise.all([
      getWeeklyActivitySeries(),
      getMonthlyActivitySeries(),
      getDailyBriefingCore(),
      getManagerAlerts(),
    ]),
  );

  const [newInquiries, recentProperties, recentClients, recentActivity] = await withDbRetry(() =>
    Promise.all([
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { agent: { select: { name: true } } } }),
      prisma.user.findMany({ where: { role: "CLIENT" }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { agent: { select: { name: true } }, property: { select: { title: true } } },
      }),
    ]),
  );

  const staleProperties = alerts.filter((a) => a.type === "STALE_PROPERTY" || a.type === "NO_ACTIVITY").length;
  const missingImages = alerts.filter((a) => a.type === "MISSING_IMAGES").length;
  const openInquiries = alerts.filter((a) => a.type === "CLIENT_WAITING").length;

  const kpiCards = [
    { label: "נכסים פעילים", value: kpis.activeProperties, icon: Building2 },
    { label: "למכירה", value: kpis.forSale, icon: Home },
    { label: "להשכרה", value: kpis.forRent, icon: KeyRound },
    { label: "לקוחות", value: kpis.totalClients, icon: Users },
    { label: "מתווכים", value: kpis.totalAgents, icon: UserCog },
    { label: "עסקאות שנסגרו החודש", value: kpis.closedDealsThisMonth, icon: Handshake },
    { label: "ביקורים השבוע", value: kpis.visitsThisWeek, icon: CalendarCheck },
    { label: "פגישות השבוע", value: kpis.meetingsThisWeek, icon: Users2 },
    { label: "שיחות השבוע", value: kpis.callsThisWeek, icon: Phone },
    { label: "פניות חדשות", value: newInquiries, icon: Building2 },
  ];

  const quickActions = [
    { label: "הוספת נכס", href: "/agent/properties/new", icon: Plus },
    { label: "לקוח חדש", href: "/agent/clients/new", icon: UserPlus },
    { label: "כל הנכסים", href: "/agent/properties", icon: Building },
    { label: "חיפוש", href: "/manager/search", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <DailyBriefing
          name={user.name?.split(" ")[0] ?? ""}
          visitsToday={briefingCore.visitsToday}
          keysOutstanding={briefingCore.keysOutstanding}
          newClientsThisWeek={briefingCore.newClientsThisWeek}
          dealsClosedYesterday={briefingCore.dealsClosedYesterday}
          staleProperties={staleProperties}
          missingImages={missingImages}
          openInquiries={openInquiries}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <QuickActions actions={quickActions} />
      </FadeIn>

      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((stat) => (
          <StaggerItem key={stat.label}>
            <KpiCard label={stat.label} value={stat.value} icon={stat.icon} />
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn delay={0.1} className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">התפלגות נכסים</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyDistributionPie sale={distribution.sale} rent={distribution.rent} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">ביצועי מתווכים (השבוע)</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentPerformanceBar data={agentPerformance} />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פעילות שבועית</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyActivityChart data={weeklyActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פעילות חודשית</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyActivityChart data={monthlyActivity} />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2} className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">התראות</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsWidget alerts={alerts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">נכסים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProperties.map((property) => (
              <Link
                key={property.id}
                href={`/agent/properties/${property.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.city} · {property.agent.name}
                  </p>
                </div>
                <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">לקוחות אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/agent/clients/${client.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <span className="font-medium">{client.name}</span>
                <span className="text-xs text-muted-foreground">{client.email}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פעילות משרד אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogList logs={recentActivity} showProperty />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
