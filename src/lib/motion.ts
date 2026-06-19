import type { Variants } from "motion/react";

/**
 * Shared motion language for Casa Madre.
 * Slow, eased, never bouncy — premium reads as restraint.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

// Item: a single item that can be used to animate opacity and y position.
export const itemAnimation = (reduce: boolean | null): Variants =>
  reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
      };

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
    show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: reduce ? 0 : 0.15, ease: EASE } },
  };
}

// RestrainedView: a single slow fade-up on enter (no bounce), collapsing to a
// plain fade when reduced motion is requested.
export const restrainedAnimation = (reduce: boolean | null): Variants =>
  reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      };

// HeroScale: a subtle image zoom-in on mount (no bounce), collapsing to a
// plain scale when reduced motion is requested.
export const heroScaleAnimation = (reduce: boolean | null): Variants =>
  reduce
    ? { hidden: { scale: 1 }, show: { scale: 1 } }
    : {
        hidden: { scale: 1.3 },
        show: { scale: 1, transition: { duration: 2, ease: "easeOut" } },
      };
      