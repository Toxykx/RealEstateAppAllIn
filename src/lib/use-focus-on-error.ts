"use client";

import { useEffect, type RefObject } from "react";

/**
 * Focuses the first field in a form whenever a truthy error appears —
 * gives keyboard/screen-reader users an immediate point of return after a
 * failed submission, without needing per-field validation state.
 */
export function useFocusOnError(formRef: RefObject<HTMLFormElement | null>, error: unknown) {
  useEffect(() => {
    if (!error) return;
    formRef.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
  }, [error, formRef]);
}
