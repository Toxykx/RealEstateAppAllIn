"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/client", label: "הנכסים שלי", shortLabel: "נכסים", icon: Home },
  { href: "/client/search", label: "חיפוש נכסים", shortLabel: "חיפוש", icon: Search },
  { href: "/client/updates", label: "עדכונים", shortLabel: "עדכונים", icon: Bell },
  { href: "/client/profile", label: "פרופיל", shortLabel: "פרופיל", icon: User },
];

export function ClientShell({
  unreadCount,
  children,
}: {
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <BrandLogo markClassName="h-7 w-7 text-sm" />
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium tracking-wide",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/client/updates" && unreadCount > 0 && (
                  <Badge className="ms-1 h-5 min-w-5 justify-center px-1">{unreadCount}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="icon-sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      <main className="flex-1 bg-background p-4 pb-24 sm:pb-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card sm:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-3 text-xs font-medium tracking-wide",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active && <span className="absolute top-0 h-[2px] w-8 bg-primary" />}
              <Icon className="h-5 w-5" />
              {item.shortLabel}
              {item.href === "/client/updates" && unreadCount > 0 && (
                <Badge className="absolute end-4 top-1 h-4 min-w-4 justify-center px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
