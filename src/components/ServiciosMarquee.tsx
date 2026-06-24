"use client";

import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { CTALink } from "@/components/ui/CTALink";
import { SERVICES } from "@/lib/services";

type ServiceItem = { title: string; description: string };

type Card = {
  key: string;
  slug: string;
  Icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * Home services teaser — a slow, seamless right-to-left marquee of service
 * cards. The track holds two copies of the set so the CSS transform loop is
 * gapless; it pauses on hover/focus. Under reduced motion it renders a static,
 * non-animating wrapped row instead (no movement at all).
 */
export function ServiciosMarquee() {
  const t = useTranslations("servicios");
  const items = t.raw("items") as ServiceItem[];
  const locale = useLocale();
  const reduce = useReducedMotion();

  const cards: Card[] = SERVICES.map((svc) => ({
    key: svc.key,
    slug: svc.slug,
    Icon: svc.icon,
    title: items[svc.index].title,
    description: items[svc.index].description,
  }));

  const renderCard = (card: Card, duplicate = false) => {
    const { Icon } = card;
    return (
      <a
        key={`${card.key}${duplicate ? "-dup" : ""}`}
        href={`/${locale}/servicios/${card.slug}`}
        // The second (duplicate) set exists only for the seamless loop — keep it
        // out of the a11y tree and tab order.
        aria-hidden={duplicate || undefined}
        tabIndex={duplicate ? -1 : undefined}
        className="flex w-[300px] max-w-full shrink-0 flex-col gap-4 rounded-card border border-line bg-cream p-7 transition-colors duration-500 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <Icon className="h-7 w-7 text-clay" strokeWidth={1.25} aria-hidden />
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-brown">
          {card.title}
        </h3>
        <p className="text-[14px] leading-[1.55] text-deep/80">
          {card.description}
        </p>
      </a>
    );
  };

  return (
    <Section id="servicios" aria-labelledby="servicios-kicker" className="bg-bone">
      <Kicker id="servicios-kicker">{t("kicker")}</Kicker>

      {reduce ? (
        // Reduced motion → static wrapped row, no movement.
        <div className="mt-12 flex flex-wrap gap-6">
          {cards.map((card) => renderCard(card))}
        </div>
      ) : (
        <div className="services-marquee mt-12 w-full overflow-hidden">
          <div className="services-marquee-track flex w-max">
            {cards.map((card) => renderCard(card))}
            {cards.map((card) => renderCard(card, true))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <CTALink href={`/${locale}/servicios`}>{t("viewAll")}</CTALink>
      </div>
    </Section>
  );
}
