"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { EASE } from "@/lib/motion";

/**
 * Home-page teaser for the Método, which now lives in full on /about. Echoes
 * the dark Método band as a single editorial statement that links onward.
 */
export function MetodoTeaser() {
  const t = useTranslations("metodo");
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <Section
      aria-labelledby="metodo-teaser-kicker"
      className="bg-brown text-cream"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <Kicker id="metodo-teaser-kicker" tone="sand">
          {t("kicker")}
        </Kicker>
        <SerifHeading
          as="h2"
          className="mt-5 max-w-[24ch] text-[34px] leading-[1.04] sm:text-[48px]"
        >
          {t("intro")}
        </SerifHeading>
        <div className="mt-9">
          <CTALink href={`/${locale}/about`} variant="onDark">
            {t("teaserCta")}
          </CTALink>
        </div>
      </motion.div>
    </Section>
  );
}
