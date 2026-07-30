"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Container + item pair for a list/grid entrance where each child fades in
 * slightly after the previous one. Use StaggerList around a set of
 * StaggerItem-wrapped cards (KPI cards, property cards, table rows, etc).
 * Reduced-motion is checked per-instance (see fade-in.tsx for why no root
 * MotionConfig provider is used).
 */
export function StaggerList({
  stagger = 0.05,
  className,
  children,
  ...props
}: { stagger?: number } & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: shouldReduceMotion ? 0 : stagger } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  y = 8,
  className,
  children,
  ...props
}: { y?: number } & HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : y },
        show: { opacity: 1, y: 0, transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: EASE } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
