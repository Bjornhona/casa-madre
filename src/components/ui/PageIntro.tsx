"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { filled, isEmpty } from "@/lib/content";
import { cn } from "@/lib/cn";

type PageIntroProps = {
  /**
   * Rendered above the heading. A node rather than a string so the caller owns
   * the Kicker (and its `id`, where a section is labelled by it). Omit it and
   * the slot closes up — the heading loses its top margin rather than leaving
   * a gap where a label would have been.
   */
  kicker?: ReactNode;
  heading: string;
  /** One entry per paragraph, same shape as `intro` / `tagline`. */
  body: string[];
  /** Spacing against whatever sits above; the component sets none itself. */
  className?: string;
};

/**
 * The editorial intro treatment lifted from the Quiénes somos manifesto:
 * kicker, serif heading, then a narrow measure of body copy, revealed with the
 * shared stagger.
 *
 * Every part is optional in practice — an unwritten heading or body drops out
 * along with its spacing, so a half-filled catalog entry can't leave an orphan
 * gap. Emptiness is decided by `filled`/`isEmpty` (see @/lib/content), the same
 * rule the service sections use.
 */
export function PageIntro({
  kicker,
  heading,
  body,
  className,
}: PageIntroProps) {
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce, { y: 20, duration: 0.7 });

  const paragraphs = filled(body);
  const hasKicker = kicker != null;
  const hasHeading = !isEmpty(heading);

  if (!hasKicker && !hasHeading && paragraphs.length === 0) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {hasKicker && <motion.div variants={item}>{kicker}</motion.div>}

      {hasHeading && (
        <motion.div variants={item}>
          <SerifHeading
            as="h2"
            className={cn(
              "text-[30px] leading-[1.08] text-brown sm:text-[40px]",
              hasKicker && "mt-5",
            )}
          >
            {heading}
          </SerifHeading>
        </motion.div>
      )}

      {paragraphs.length > 0 && (
        <motion.div
          variants={item}
          className={cn((hasKicker || hasHeading) && "mt-6")}
        >
          {paragraphs.map((paragraph, i) => (
            <motion.p
              key={i}
              variants={item}
              className="mt-2 max-w-136 text-[18px] leading-[1.7] text-deep/85"
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
