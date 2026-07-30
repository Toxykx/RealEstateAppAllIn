"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * A fast, subtle content fade on route change. Deliberately scoped to the
 * authenticated dashboard shells (agent/manager sidebar, client bottom-nav)
 * rather than the whole app — the public marketing/catalog pages should feel
 * like instant standard web navigation, not a wrapped "app" transition.
 *
 * Note: a global `<MotionConfig reducedMotion="user">` wrapped around the
 * whole app (in the root layout) was tried first and reverted after it
 * appeared to interfere with Next's root Suspense/streaming boundary in dev.
 * Every motion primitive here instead checks `useReducedMotion()` itself,
 * which is just as effective and has no such risk.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
