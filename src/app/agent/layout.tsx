import { LayoutDashboard, Users, Building, UserCircle } from "lucide-react";
import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navItems = [
  { href: "/agent", label: "לוח בקרה", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/agent/clients", label: "לקוחות", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "נכסים", icon: <Building className="h-4 w-4" /> },
  { href: "/agent/profile", label: "פרופיל", icon: <UserCircle className="h-4 w-4" /> },
];

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["AGENT", "MANAGER"]);

  return (
    <DashboardShell
      navItems={navItems}
      userName={user.name ?? ""}
      roleLabel={user.role === "MANAGER" ? "מנהל" : "מתווך"}
    >
      {children}
    </DashboardShell>
  );
}
