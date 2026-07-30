"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Textarea with a live character counter. Purely a UX guide (the limit is
 * not enforced server-side / in the Zod schema) — it just gives typing
 * feedback for long free-text fields like descriptions and messages.
 */
export function TextareaWithCounter({
  maxLength,
  defaultValue,
  className,
  onChange,
  ...props
}: React.ComponentProps<typeof Textarea> & { maxLength?: number }) {
  const [length, setLength] = useState(typeof defaultValue === "string" ? defaultValue.length : 0);

  return (
    <div className="space-y-1">
      <Textarea
        defaultValue={defaultValue}
        className={className}
        onChange={(e) => {
          setLength(e.target.value.length);
          onChange?.(e);
        }}
        {...props}
      />
      {maxLength && (
        <p
          className={cn(
            "text-end text-xs text-muted-foreground",
            length > maxLength && "text-destructive",
          )}
        >
          {length} / {maxLength}
        </p>
      )}
    </div>
  );
}
