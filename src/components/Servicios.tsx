"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { fadeUp } from "@/lib/motion";
import {
  SERVICES,
  SERVICE_GRID_COLUMNS,
  SERVICE_GRID_COLUMNS_MD,
} from "@/lib/services";

type ServiceItem = { title: string; description: string };

/**
 * Services overview — the "Áreas de trabajo" bordered grid: one continuous
 * divided rectangle, one cell per entry in SERVICES, each linking to its detail
 * page. Column counts and border logic live in `.services-grid` in globals.css
 * and are tuned to how many services there are — check it when the set grows.
 */
export function Servicios() {
  const t = useTranslations("servicios");
  const tHub = useTranslations("serviciosHub");
  const items = t.raw("items") as ServiceItem[];
  const locale = useLocale();
  const reduce = useReducedMotion();
  const reveal = fadeUp(reduce, { y: 16, duration: 0.7 });

  return (
    <Section id="servicios" aria-labelledby="servicios-kicker" className="bg-bone">
      <Kicker id="servicios-kicker">{tHub("gridLabel")}</Kicker>

      <motion.ul
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        // Column counts travel from the SERVICES array into the stylesheet,
        // so adding or removing a service re-flows the grid on its own.
        style={
          {
            "--services-cols": SERVICE_GRID_COLUMNS,
            "--services-cols-md": SERVICE_GRID_COLUMNS_MD,
          } as React.CSSProperties
        }
        className="services-grid mt-12 overflow-hidden rounded-card"
      >
        {SERVICES.map((svc) => {
          const service = items[svc.index];
          const Icon = svc.icon;
          return (
            <li key={svc.key} id={svc.key} className="scroll-mt-28">
              <a
                href={`/${locale}/services/${svc.slug}`}
                // Top-aligned, not centred: centring let a card's own content
                // height decide where its icon sat, so a 2-line title or a
                // 3-line description knocked the whole row out of register.
                // Anchored to the top, every icon and title starts at the same
                // y. Descriptions then end wherever they end, which reads as
                // intentional ragging rather than misalignment.
                className="flex h-full min-h-52.5 w-full flex-col items-center justify-start px-5.5 py-8.5 text-center transition-colors duration-500 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brown"
              >
                {/* Fixed-height icon block. The icons are a uniform h-8 today,
                    but reserving the row means a taller or shorter glyph can't
                    shift the title baseline underneath it. */}
                <span className="flex h-12 shrink-0 items-center justify-center">
                  <Icon className="h-8 w-8 text-brown" strokeWidth={1.25} aria-hidden />
                </span>
                <h3 className="mt-2.5 mb-3.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-brown">
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
