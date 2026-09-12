"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/actions/auth";
import { PageTransition } from "@/components/motion/page-transition";
import { PushPrompt } from "@/components/notifications/push-prompt";
import { QuickAppointmentButton } from "@/components/appointments/quick-appointment-button";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function DashboardShell({
  navItems,
  userName,
  roleLabel,
  properties,
  children,
}: {
  navItems: DashboardNavItem[];
  userName: string;
  roleLabel: string;
  properties: { id: string; title: string; city: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-card sm:flex">
        <div className="flex h-20 items-center border-b border-border px-6">
          <BrandLogo />
        </div>
        <div className="px-3 pt-3">
          <QuickAppointmentButton properties={properties} className="w-full" />
        </div>
        <nav className="flex-1 space-y-1 p-3 pt-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 border-e-2 px-3.5 py-2.5 text-sm font-medium tracking-wide transition-colors",
                  active
                    ? "border-primary bg-primary/[0.07] text-primary"
                    : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium text-foreground">{userName}</p>
            <p className="text-xs tracking-wide text-muted-foreground">{roleLabel}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" /> התנתקות
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 min-h-16 items-center justify-between gap-2 border-b border-border bg-card px-4 pt-[env(safe-area-inset-top)] sm:hidden">
          <BrandLogo />
          <div className="flex items-center gap-1">
            <QuickAppointmentButton properties={properties} compact />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="icon-sm" className="size-11 sm:size-7" aria-label="התנתקות">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 [overscroll-behavior-x:contain] sm:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center rounded-sm px-3 py-2.5 text-sm font-medium",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <PushPrompt />
    </div>
  );
}
