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
    { label: "Agents", value: agentCount },
    { label: "Clients", value: clientCount },
    { label: "Properties", value: propertyCount },
    { label: "New inquiries", value: newInquiries },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(" ")[0]}</h1>
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
