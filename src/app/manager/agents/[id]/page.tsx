import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateAgent } from "@/lib/actions/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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

  const boundUpdate = updateAgent.bind(null, agent.id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/manager/agents" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה לסוכנים
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{agent.name}</h1>
        <p className="text-muted-foreground">{agent.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">חשבון</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={boundUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא</Label>
              <Input id="name" name="name" defaultValue={agent.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" name="phone" defaultValue={agent.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">תפקיד</Label>
              <Select
                name="role"
                defaultValue={agent.role}
                items={[
                  { value: "AGENT", label: "סוכן" },
                  { value: "MANAGER", label: "מנהל" },
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">סוכן</SelectItem>
                  <SelectItem value="MANAGER">מנהל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" name="isActive" defaultChecked={agent.isActive} />
              <Label htmlFor="isActive">חשבון פעיל</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              מנהל/ת {agent._count.managedClients} לקוחות ו-{agent._count.agentProperties}{" "}
              נכסים.
            </p>
            <Button type="submit">שמירת שינויים</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
