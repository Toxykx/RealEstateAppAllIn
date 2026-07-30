import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateAgent } from "@/lib/actions/agents";
import { getAgentStats } from "@/lib/stats";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { ActionForm } from "@/components/action-form";
import { CreatedToast } from "@/components/created-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(["MANAGER"]);

  const agent = await prisma.user.findFirst({
    where: { id, role: { in: ["AGENT", "MANAGER"] } },
    include: { _count: { select: { agentProperties: true, managedClients: true } } },
  });
  if (!agent) notFound();

  const [weeklyStats, monthlyStats, activeProperties, keysHeld, recentActivity] = await Promise.all([
    getAgentStats(agent.id, "week"),
    getAgentStats(agent.id, "month"),
    prisma.property.count({
      where: { agentId: agent.id, listingStatus: { in: ["AVAILABLE", "IN_PROGRESS"] } },
    }),
    prisma.property.findMany({
      where: { keyHolderId: agent.id },
      select: { id: true, title: true },
    }),
    prisma.activityLog.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { agent: { select: { name: true } } },
    }),
  ]);

  const boundUpdate = updateAgent.bind(null, agent.id);

  const statRows: { label: string; key: keyof typeof weeklyStats }[] = [
    { label: "ביקורים", key: "visits" },
    { label: "פגישות", key: "meetings" },
    { label: "שיחות", key: "calls" },
    { label: "נכסים שנוספו", key: "propertiesAdded" },
    { label: "עדכוני ציר זמן", key: "timelineUpdates" },
    { label: "עסקאות שנסגרו", key: "closedDeals" },
    { label: "מפתחות שהוחזרו", key: "keysReturned" },
    { label: "מפתחות ממתינים", key: "keysOutstanding" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Suspense fallback={null}>
        <CreatedToast message="המתווך נוצר בהצלחה" />
      </Suspense>
      <div>
        <Link href="/manager/agents" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה למתווכים
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{agent.name}</h1>
        <p className="text-muted-foreground">{agent.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">חשבון</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={boundUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" required>שם מלא</Label>
                <Input id="name" name="name" defaultValue={agent.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" name="phone" defaultValue={agent.phone ?? ""} placeholder="05X-XXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" required>תפקיד</Label>
                <Select
                  name="role"
                  defaultValue={agent.role}
                  items={[
                    { value: "AGENT", label: "מתווך" },
                    { value: "MANAGER", label: "מנהל" },
                  ]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT">מתווך</SelectItem>
                    <SelectItem value="MANAGER">מנהל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isActive" name="isActive" defaultChecked={agent.isActive} />
                <Label htmlFor="isActive">חשבון פעיל</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {activeProperties} נכסים פעילים · {agent._count.managedClients} לקוחות ·{" "}
                {agent._count.agentProperties} נכסים בסך הכול.
              </p>
              <SubmitButton pendingLabel="שומר...">שמירת שינויים</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">ביצועים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2 font-medium text-muted-foreground">
              <span>מדד</span>
              <span className="text-center">השבוע</span>
              <span className="text-center">החודש</span>
            </div>
            {statRows.map((row) => (
              <div key={row.key} className="grid grid-cols-3 items-center gap-2">
                <span>{row.label}</span>
                <span className="rounded-md border py-1 text-center font-heading text-primary">
                  {weeklyStats[row.key]}
                </span>
                <span className="rounded-md border py-1 text-center font-heading text-primary">
                  {monthlyStats[row.key]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">מפתחות מוחזקים ({keysHeld.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {keysHeld.length === 0 && (
              <EmptyState icon={KeyRound} message="אין מפתחות אצל המתווך כרגע" compact />
            )}
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogList logs={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
