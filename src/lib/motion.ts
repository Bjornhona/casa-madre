import type { Variants } from "motion/react";

/**
 * Shared motion language for Casa Madre.
 * Slow, eased, never bouncy — premium reads as restraint.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fade + slight translate-up reveal — the locked Hero/About timing.
 * Collapses to a plain fade (no transform) when reduced motion is requested.
 */
export function fadeUp(
  reduce: boolean | null,
  { y = 24, duration = 0.7 }: { y?: number; duration?: number } = {},
): Variants {
  return reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
      };
}

/** Stagger container for whileInView reveals. */
export function staggerContainer(reduce: boolean | null, stagger = 0.12): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };
}
