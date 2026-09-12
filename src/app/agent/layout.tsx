import { requireUserOrRedirect, agentScope } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { agentNavItems, managerNavItems } from "@/lib/dashboard-nav";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["AGENT", "MANAGER"]);
  const isManager = user.role === "MANAGER";

  const properties = await prisma.property.findMany({
    where: agentScope(user, "agentId"),
    select: { id: true, title: true, city: true },
    orderBy: { title: "asc" },
  });

  return (
    <DashboardShell
      navItems={isManager ? managerNavItems : agentNavItems}
      userName={user.name ?? ""}
      roleLabel={isManager ? "מנהל" : "מתווך"}
      properties={properties}
    >
      {children}
    </DashboardShell>
  );
}
