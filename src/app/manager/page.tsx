import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ManagerDashboardPage() {
  const user = await requireUser(["MANAGER"]);

  const [agentCount, clientCount, propertyCount, newInquiries] = await Promise.all([
    prisma.user.count({ where: { role: "AGENT" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.property.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const stats = [
    { label: "מתווכים", value: agentCount },
    { label: "לקוחות", value: clientCount },
    { label: "נכסים", value: propertyCount },
    { label: "פניות חדשות", value: newInquiries },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ברוכים השבים, {user.name?.split(" ")[0]}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
