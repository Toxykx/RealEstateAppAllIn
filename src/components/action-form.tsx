"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export type ActionData = { success: boolean; message: string };
export type ActionResult = ActionData | void;

/**
 * Wraps a server action bound to a <form> so its result (success/error)
 * surfaces as a toast. The action must return { success, message } — plain
 * void returns (e.g. validation no-ops) simply show no toast.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<ActionData | null, FormData>(async (_prev, formData) => {
    return (await action(formData)) ?? null;
  }, null);

  const lastHandled = useRef<ActionData | null>(null);

  useEffect(() => {
    if (!state || state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
