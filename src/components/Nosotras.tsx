"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";

// Editorial portrait placeholder; swap for the founders' photography at launch.
const NOSOTRAS_IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=85";

export function Nosotras() {
  const t = useTranslations("nosotras");
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce);

  return (
    <Section id="nosotras" aria-labelledby="nosotras-kicker">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-[70px]">
        {/* Portrait first on desktop, but after the heading in the source for reading order. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-card shadow-soft md:order-first"
        >
          <Image
            src={NOSOTRAS_IMAGE}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={item}>
            <Kicker id="nosotras-kicker">{t("kicker")}</Kicker>
          </motion.div>
          <motion.div variants={item}>
            <SerifHeading
              as="h2"
              className="mt-5 text-[32px] leading-[1.06] text-brown sm:text-[44px]"
            >
              {t("headline")}
            </SerifHeading>
          </motion.div>
          <motion.p
            variants={item}
            className="mt-8 max-w-[34rem] text-[18px] leading-[1.6] text-deep/85"
          >
            {t("body")}
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
}
