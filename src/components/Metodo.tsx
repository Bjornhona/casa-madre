"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Step = { number: string; title: string; description: string };

export function Metodo() {
  const t = useTranslations("metodo");
  const steps = t.raw("steps") as Step[];
  const reduce = useReducedMotion();
  // Gentler reveal so the motion doesn't fight the colour inversion.
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce, { y: 16, duration: 0.8 });

  return (
    <Section
      id="metodo"
      aria-labelledby="metodo-kicker"
      className="bg-brown text-cream"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={item}>
          <Kicker id="metodo-kicker" tone="sand">
            {t("kicker")}
          </Kicker>
        </motion.div>
        <motion.div variants={item}>
          <SerifHeading
            as="h2"
            className="mt-5 max-w-[20ch] text-[34px] leading-[1.04] sm:text-[48px]"
          >
            {t("intro")}
          </SerifHeading>
        </motion.div>

        <motion.ol
          variants={container}
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5"
        >
          {steps.map((step) => (
            <motion.li
              key={step.number}
              variants={item}
              className="border-t border-cream/20 pt-6"
            >
              <span className="block font-serif text-[40px] leading-none text-sand">
                {step.number}
              </span>
              <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.55] text-cream/75">
                {step.description}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </Section>
  );
}
