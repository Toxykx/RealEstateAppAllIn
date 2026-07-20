import { LayoutDashboard, Users, Building, UserCog, Mail } from "lucide-react";
import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navItems = [
  { href: "/manager", label: "סקירה כללית", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/manager/agents", label: "סוכנים", icon: <UserCog className="h-4 w-4" /> },
  { href: "/agent/clients", label: "לקוחות", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "נכסים", icon: <Building className="h-4 w-4" /> },
  { href: "/manager/inquiries", label: "פניות", icon: <Mail className="h-4 w-4" /> },
];

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["MANAGER"]);

  return (
    <DashboardShell navItems={navItems} userName={user.name ?? ""} roleLabel="מנהל">
      {children}
    </DashboardShell>
  );
}
