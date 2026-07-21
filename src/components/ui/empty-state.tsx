import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonVariants({ size: "sm" })}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
