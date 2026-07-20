"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function DashboardShell({
  navItems,
  userName,
  roleLabel,
  children,
}: {
  navItems: DashboardNavItem[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e bg-card sm:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          אופק נכסים
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium">{userName}</p>
            <p className="text-muted-foreground">{roleLabel}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" /> התנתקות
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:hidden">
          <span className="flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5 text-primary" /> אופק נכסים
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="icon-sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-2 py-2 sm:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
