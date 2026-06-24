"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { CTALink } from "@/components/ui/CTALink";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { SERVICES } from "@/lib/services";

type ServiceItem = { title: string; description: string; cta: string };

// On the dedicated /servicios page each card links to its detail page and is an
// anchor target (#compraventa, …). On the home teaser the cards link to those
// anchors on /servicios instead.
export function Servicios({ variant = "page" }: { variant?: "home" | "page" }) {
  const t = useTranslations("servicios");
  const items = t.raw("items") as ServiceItem[];
  const locale = useLocale();
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);
  const isHome = variant === "home";

  return (
    <Section id="servicios" aria-labelledby="servicios-kicker">
      <Kicker id="servicios-kicker">{t("kicker")}</Kicker>

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
      >
        {SERVICES.map((svc) => {
          const service = items[svc.index];
          const Icon = svc.icon;
          // Home: jump to the service's section on /servicios. Page: open the
          // service's dedicated detail page.
          const href = isHome
            ? `/${locale}/servicios#${svc.key}`
            : `/${locale}/servicios/${svc.slug}`;
          return (
            <motion.li
              key={svc.key}
              id={isHome ? undefined : svc.key}
              variants={item}
              className="scroll-mt-28 bg-cream"
            >
              <a
                href={href}
                className="group flex h-full flex-col gap-5 p-9 transition-colors duration-500 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brown lg:p-10"
              >
                <Icon
                  className="h-7 w-7 text-clay"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-brown">
                  {service.title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-deep/80">
                  {service.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[11px] uppercase tracking-[0.16em] text-brown">
                  {service.cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover:translate-x-1"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </a>
            </motion.li>
          );
        })}
      </motion.ul>

      {isHome && (
        <div className="mt-12">
          <CTALink href={`/${locale}/servicios`}>{t("viewAll")}</CTALink>
        </div>
      )}
    </Section>
  );
}
