import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";

export function EmptyState({
  icon: Icon,
  message,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: {
  icon: LucideIcon;
  message: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Smaller footprint for secondary empty states inside an already busy dashboard. */
  compact?: boolean;
}) {
  return (
    <FadeIn
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border border-dashed border-border text-center",
        compact ? "gap-1.5 py-5" : "gap-3 py-10",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary",
          compact ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <div className="space-y-1">
        <p className={cn("max-w-xs font-medium text-foreground", compact ? "text-xs" : "text-sm")}>{message}</p>
        {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonVariants({ size: "sm" })}>
          {actionLabel}
        </Link>
      )}
    </FadeIn>
  );
}
