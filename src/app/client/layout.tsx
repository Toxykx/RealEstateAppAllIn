import { prisma } from "@/lib/prisma";
import { requireUserOrRedirect } from "@/lib/authz";
import { ClientShell } from "@/components/layout/client-shell";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect(["CLIENT"]);
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return <ClientShell unreadCount={unreadCount}>{children}</ClientShell>;
}
