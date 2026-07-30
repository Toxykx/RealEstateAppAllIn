"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Subtle mount-in fade + rise, for cards/sections appearing on a dashboard.
 * Checks prefers-reduced-motion itself (rather than relying on a root
 * MotionConfig provider, which breaks Next's root Suspense/streaming when
 * wrapped around the whole app — see page-transition.tsx for the same note).
 */
export function FadeIn({
  delay = 0,
  y = 8,
  duration = 0.35,
  className,
  children,
  ...props
}: {
  delay?: number;
  y?: number;
  duration?: number;
} & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration, delay, ease: EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
