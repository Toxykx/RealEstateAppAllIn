import { LayoutDashboard, Users, Building } from "lucide-react";
import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navItems = [
  { href: "/agent", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/agent/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "Properties", icon: <Building className="h-4 w-4" /> },
];

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["AGENT", "MANAGER"]);

  return (
    <DashboardShell
      navItems={navItems}
      userName={user.name ?? ""}
      roleLabel={user.role === "MANAGER" ? "Manager" : "Agent"}
    >
      {children}
    </DashboardShell>
  );
}
