import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { agentNavItems, managerNavItems } from "@/lib/dashboard-nav";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["AGENT", "MANAGER"]);
  const isManager = user.role === "MANAGER";

  return (
    <DashboardShell
      navItems={isManager ? managerNavItems : agentNavItems}
      userName={user.name ?? ""}
      roleLabel={isManager ? "מנהל" : "מתווך"}
    >
      {children}
    </DashboardShell>
  );
}
