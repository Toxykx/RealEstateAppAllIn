import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-md border border-border p-4 text-center text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary">
                <action.icon className="h-4 w-4" />
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
