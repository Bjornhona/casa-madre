"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { EASE } from "@/lib/motion";

// Editorial placeholder image, warm-graded to sit with the hero.
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85";

export function AboutIntro() {
  const t = useTranslations("about");
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      };

  return (
    <Section id="about" aria-labelledby="about-kicker">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-[70px]">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={item}>
            <Kicker id="about-kicker">{t("kicker")}</Kicker>
          </motion.div>
          <motion.div variants={item}>
            <SerifHeading
              as="h2"
              className="mt-5 text-[32px] leading-[1.08] text-brown sm:text-[38px]"
            >
              {t("headlinePart1")}
              <em className="italic">{t("headlineEmphasis")}</em>
              {t("headlinePart2")}
            </SerifHeading>
          </motion.div>
          <motion.p
            variants={item}
            className="mt-8 max-w-[34rem] text-[18px] leading-[1.6] text-deep/85"
          >
            {t("body")}
          </motion.p>
          <motion.div variants={item} className="mt-7">
            <CTALink href="#nosotras">{t("cta")}</CTALink>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-card shadow-soft"
        >
          {/* Decorative editorial placeholder; swap for client photography at launch. */}
          <Image
            src={ABOUT_IMAGE}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </Section>
  );
}
