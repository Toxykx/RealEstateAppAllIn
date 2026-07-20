import { requireUserOrRedirect } from "@/lib/authz";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { managerNavItems } from "@/lib/dashboard-nav";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["MANAGER"]);

  return (
    <DashboardShell navItems={managerNavItems} userName={user.name ?? ""} roleLabel="מנהל">
      {children}
    </DashboardShell>
  );
}
