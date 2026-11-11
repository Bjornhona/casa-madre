"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { PageIntro } from "@/components/ui/PageIntro";
import { CTALink } from "@/components/ui/CTALink";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Editorial framing above the "Áreas de trabajo" grid, in the shared PageIntro
 * treatment. `intro.title` used to be set as a Kicker — a 54-character
 * sentence rendered as a 12px tracked label — so it now gets the serif heading
 * it actually reads as.
 *
 * No kicker here, deliberately. The only candidate in this namespace is
 * `gridLabel`, which Servicios.tsx already renders as the kicker of the grid
 * immediately below; reusing it would print the same label twice on one page,
 * and "Áreas de trabajo" labels the eight cards rather than this paragraph.
 * Inventing new copy for the slot isn't ours to do, so it stays closed.
 */
export function ServiciosIntro() {
  const t = useTranslations("serviciosHub.intro");

  return (
    <Section className="border-line border-b-1">
      <PageIntro heading={t("title")} body={t.raw("body") as string[]} />
    </Section>
  );
}

/** Editorial closing after the grid, with the one-line network link to /about. */
export function ServiciosClosing() {
  const t = useTranslations("serviciosHub.closing");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce, { y: 18, duration: 0.7 });

  return (
    <Section className="border-line border-t-1">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="max-w-[60ch]"
      >
        <motion.p
          variants={item}
          className="font-serif text-[24px] italic leading-[1.4] text-brown sm:text-[29px]"
        >
          {t("body")}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-8 text-[15px] font-light leading-[1.7] text-deep/75"
        >
          {t("networkLine")}{" "}
          <a
            href={`/${locale}/about`}
            className="group inline-flex items-center gap-1.5 whitespace-nowrap text-brown underline decoration-clay/50 underline-offset-4 transition-colors duration-300 hover:decoration-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            {t("networkLink")}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              strokeWidth={1.5}
              aria-hidden
            />
          </a>
        </motion.p>
      </motion.div>
    </Section>
  );
}

/** Final CTA band → contact page. */
export function ServiciosCta() {
  const t = useTranslations("serviciosHub.cta");
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <section className="px-6 pb-20 pt-2 sm:px-10 lg:px-12">
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto w-full max-w-[1240px] rounded-card bg-deep px-6 py-16 text-cream sm:px-12 lg:px-16"
      >
        <SerifHeading
          as="h2"
          className="max-w-[20ch] text-[30px] leading-[1.08] sm:text-[40px]"
        >
          {t("title")}
        </SerifHeading>
        <p className="mt-5 max-w-[48ch] text-[15px] font-light leading-[1.6] text-cream/75">
          {t("text")}
        </p>
        <div className="mt-9">
          <CTALink href={`/${locale}/contact`} variant="onDark">
            {t("button")}
          </CTALink>
        </div>
      </motion.div>
    </section>
  );
}
