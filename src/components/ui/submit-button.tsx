"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/**
 * Drop-in replacement for <Button type="submit"> inside any <form> (whether
 * driven by ActionForm or a raw useActionState form) — automatically shows a
 * spinner and disables itself while the action is pending, via useFormStatus
 * reading the nearest ancestor <form>'s state.
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    pendingLabel?: string;
  }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
