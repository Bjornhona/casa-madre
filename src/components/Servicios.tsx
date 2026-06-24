"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { fadeUp } from "@/lib/motion";
import { SERVICES } from "@/lib/services";

type ServiceItem = { title: string; description: string };

/**
 * Services overview — the "Áreas de trabajo" bordered grid: one continuous
 * divided rectangle of six cells, each linking to its detail page. Border logic
 * (6 → 3 → 1 columns) lives in `.services-grid` in globals.css.
 */
export function Servicios() {
  const t = useTranslations("servicios");
  const items = t.raw("items") as ServiceItem[];
  const locale = useLocale();
  const reduce = useReducedMotion();
  const reveal = fadeUp(reduce, { y: 16, duration: 0.7 });

  return (
    <Section id="servicios" aria-labelledby="servicios-kicker">
      <Kicker id="servicios-kicker">{t("kicker")}</Kicker>

      <motion.ul
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="services-grid mt-12 overflow-hidden rounded-card"
      >
        {SERVICES.map((svc) => {
          const service = items[svc.index];
          const Icon = svc.icon;
          return (
            <li key={svc.key} id={svc.key} className="scroll-mt-28">
              <a
                href={`/${locale}/servicios/${svc.slug}`}
                className="flex h-full min-h-[210px] w-full flex-col items-center justify-center px-[22px] py-[34px] text-center transition-colors duration-500 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brown"
              >
                <Icon
                  className="mb-[18px] h-8 w-8 text-brown"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <h3 className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-brown">
                  {service.title}
                </h3>
                <p className="max-w-[26ch] text-[13px] leading-[1.5] text-muted">
                  {service.description}
                </p>
              </a>
            </li>
          );
        })}
      </motion.ul>
    </Section>
  );
}
