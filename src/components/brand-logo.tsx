import { cn } from "@/lib/utils";

export function BrandLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center border border-primary/50 font-serif text-base text-primary",
          markClassName,
        )}
      >
        A
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.05rem] tracking-wide text-foreground">ALL IN</span>
        <span className="mt-0.5 text-[9px] font-medium tracking-[0.28em] text-muted-foreground">
          REAL ESTATE
        </span>
      </span>
    </span>
  );
}
