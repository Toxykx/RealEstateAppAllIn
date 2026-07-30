"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Counts up (or down) to `value` on mount/change. Mutates the span's
 * textContent directly via ref instead of re-rendering React every frame, so
 * this stays cheap even on dashboards with a dozen of these mounted at once.
 */
export function AnimatedNumber({
  value,
  duration = 0.8,
  className,
  format,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const render = format ?? ((n: number) => String(n));

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) ref.current.textContent = render(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = render(Math.round(latest));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {render(shouldReduceMotion ? value : 0)}
    </span>
  );
}
