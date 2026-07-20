import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEAL_STAGE_STEPS } from "@/lib/format";

export function DealProgress({ currentStageIndex }: { currentStageIndex: number }) {
  return (
    <ul className="space-y-0">
      {DEAL_STAGE_STEPS.map((step, i) => {
        const done = i < currentStageIndex;
        const current = i === currentStageIndex;
        const last = i === DEAL_STAGE_STEPS.length - 1;

        return (
          <li key={step.value} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary bg-transparent",
                  !done && !current && "border-border bg-transparent",
                )}
              >
                {done && <Check className="h-3 w-3" strokeWidth={3} />}
                {current && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </span>
              {!last && (
                <span className={cn("w-px flex-1", done ? "bg-primary/50" : "bg-border")} />
              )}
            </div>
            <span
              className={cn(
                "pb-5 text-sm",
                done && "text-foreground",
                current && "font-medium text-primary",
                !done && !current && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
