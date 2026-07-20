import { LayoutDashboard, Users, Building, UserCog, Mail } from "lucide-react";
import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navItems = [
  { href: "/manager", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/manager/agents", label: "Agents", icon: <UserCog className="h-4 w-4" /> },
  { href: "/agent/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "Properties", icon: <Building className="h-4 w-4" /> },
  { href: "/manager/inquiries", label: "Inquiries", icon: <Mail className="h-4 w-4" /> },
];

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["MANAGER"]);

  return (
    <DashboardShell navItems={navItems} userName={user.name ?? ""} roleLabel="Manager">
      {children}
    </DashboardShell>
  );
}
