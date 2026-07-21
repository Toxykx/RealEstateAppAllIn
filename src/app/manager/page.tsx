import { Building2, Home, KeyRound, Handshake, Users, UserCog, CalendarCheck, Users2, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { getManagerKpis, getPropertyDistribution, getAgentPerformanceComparison, getWeeklyActivitySeries } from "@/lib/stats";
import { getManagerAlerts } from "@/lib/alerts";
import { KpiCard } from "@/components/manager/kpi-card";
import { AlertsWidget } from "@/components/manager/alerts-widget";
import { PropertyDistributionPie } from "@/components/charts/property-distribution-pie";
import { AgentPerformanceBar } from "@/components/charts/agent-performance-bar";
import { WeeklyActivityChart } from "@/components/charts/weekly-activity-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ManagerDashboardPage() {
  const user = await requireUser(["MANAGER"]);

  const [kpis, distribution, agentPerformance, weeklyActivity, alerts, newInquiries] = await Promise.all([
    getManagerKpis(),
    getPropertyDistribution(),
    getAgentPerformanceComparison("week"),
    getWeeklyActivitySeries(),
    getManagerAlerts(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ברוכים השבים, {user.name?.split(" ")[0]}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((stat) => (
          <KpiCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">פעילות שבועית</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyActivityChart data={weeklyActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">התראות</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsWidget alerts={alerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
