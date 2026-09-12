import { requireUserOrRedirect } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { managerNavItems } from "@/lib/dashboard-nav";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["MANAGER"]);

  const properties = await prisma.property.findMany({
    select: { id: true, title: true, city: true },
    orderBy: { title: "asc" },
  });

  return (
    <DashboardShell navItems={managerNavItems} userName={user.name ?? ""} roleLabel="מנהל" properties={properties}>
      {children}
    </DashboardShell>
  );
}
