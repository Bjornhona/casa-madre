"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  KeyRound,
  House,
  Search,
  Armchair,
  TrendingUp,
  Scale,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { CTALink } from "@/components/ui/CTALink";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { contactoHref } from "@/lib/contacto-href";

type ServiceItem = { title: string; description: string; cta: string };

// Index-aligned with `servicios.items` in the message catalogs.
const ICONS: LucideIcon[] = [
  KeyRound, // Compraventa
  House, // Alquileres
  Search, // Personal Shopper
  Armchair, // Reformas & Home Staging
  TrendingUp, // Inversión
  Scale, // Jurídico & Financiero
];

// CTA context per service (index-aligned). `interes` pre-selects the form's
// interest dropdown; services with no obvious interest just carry the servicio.
const SERVICE_PARAMS: { servicio: string; interes?: string }[] = [
  { servicio: "compraventa", interes: "buy" },
  { servicio: "alquileres", interes: "rent" },
  { servicio: "personal-shopper", interes: "buy" },
  { servicio: "reformas" },
  { servicio: "inversion", interes: "invest" },
  { servicio: "juridico" },
];

// On the dedicated /servicios page each card is an anchor target (#compraventa,
// #alquileres, …). On the home teaser the cards link to those anchors instead.
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
        {items.map((service, index) => {
          const Icon = ICONS[index] ?? KeyRound;
          const params = SERVICE_PARAMS[index] ?? {};
          const anchor = params.servicio;
          // Home: link to the service's section on /servicios. Page: pre-fill
          // the contact form with this service's context.
          const href = isHome
            ? `/${locale}/servicios#${anchor}`
            : contactoHref(locale, params);
          return (
            <motion.li
              key={service.title}
              id={isHome ? undefined : anchor}
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
