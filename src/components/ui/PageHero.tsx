"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { EASE } from "@/lib/motion";

/**
 * Dark editorial header band for the sub-pages. Sits under the fixed cream nav
 * (which expects a dark surface beneath it), and gives each route a confident
 * title treatment built from the shared Kicker + SerifHeading primitives.
 *
 * Copy comes from the `pages.<pageKey>` catalog (kicker / title / intro).
 */
export function PageHero({ pageKey }: { pageKey: string }) {
  const t = useTranslations(`pages.${pageKey}`);
  const reduce = useReducedMotion();

  return (
    <section className="bg-deep px-6 pt-36 pb-20 text-cream sm:px-10 lg:px-12 lg:pt-40 lg:pb-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto w-full max-w-[1240px]"
      >
        <Kicker tone="sand">{t("kicker")}</Kicker>
        <SerifHeading
          as="h1"
          className="mt-5 max-w-[20ch] text-[40px] leading-[1.04] sm:text-[56px]"
        >
          {t("title")}
        </SerifHeading>
        <p className="mt-6 max-w-[52ch] text-[17px] font-light leading-[1.7] text-cream/75">
          {t("intro")}
        </p>
      </motion.div>
    </section>
  );
}
