import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GlobalActivityPage() {
  await requireUser(["MANAGER"]);

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { agent: { select: { name: true } }, property: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">מרכז פעילות</h1>
      <p className="text-sm text-muted-foreground">
        כל הפעולות המשמעותיות במשרד, לפי סדר כרונולוגי — 100 האחרונות.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פעילות משרד</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogList logs={logs} showProperty />
        </CardContent>
      </Card>
    </div>
  );
}
