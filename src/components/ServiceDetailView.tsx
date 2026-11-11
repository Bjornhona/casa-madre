"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { filled, splitLabel } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";
import { contactoHref } from "@/lib/contacto-href";
import { getServiceBySlug } from "@/lib/services";
import { serviceImage } from "@/lib/service-images";
import { PageHero } from "./ui/PageHero";

type ServiceDetailItem = {
  title: string;
  description: string;
  cta: string;
  tagline: string[];
  /** One entry per paragraph, same shape as `tagline`. */
  intro: string[];
  forWho: string;
  includes: string[];
  process: string[];
  difference: string;
};

// Public env — safe in the client bundle. Stripped to digits for the wa.me link.
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

export function ServiceDetailView({ slug }: { slug: string }) {
  const t = useTranslations("servicios");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const service = getServiceBySlug(slug);
  if (!service) return null; // the page 404s first; this is a defensive guard

  const items = t.raw("items") as ServiceDetailItem[];
  const item = items[service.index];

  const container = staggerContainer(reduce, 0.12);
  const reveal = fadeUp(reduce, { y: 20, duration: 0.7 });

  // Editorial hero image for this service. When none is set, PageHero falls back
  // to its plain dark band — no broken image.
  const heroSrc = serviceImage(slug);

  /**
   * Body sections, in order, skipping any the client hasn't written yet —
   * heading, wrapper and spacing all go together, so an unwritten section
   * leaves no trace at all. `filled` is the single place that decides what
   * counts as written (see @/lib/content).
   *
   * Collected into a list rather than inlined so the divider rule can be drawn
   * *between* blocks instead of above each one: whichever section happens to
   * come first must not open with an orphan rule, and the vertical rhythm
   * comes from the flex gap, which only applies between surviving children.
   */
  const sections: { key: string; content: ReactNode }[] = [];

  const intro = filled(item.intro);
  if (intro.length) {
    sections.push({
      key: "intro",
      content: intro.map((paragraph, i) => (
        <p
          key={i}
          className={`max-w-[65ch] text-[19px] font-light leading-[1.75] text-deep/85 sm:text-[21px] ${
            i > 0 ? "mt-6" : ""
          }`}
        >
          {paragraph}
        </p>
      )),
    });
  }

  const forWho = filled(item.forWho);
  if (forWho.length) {
    sections.push({
      key: "forWho",
      content: (
        <>
          <Kicker>{t("detail.forWhoLabel")}</Kicker>
          {forWho.map((paragraph, i) => (
            <p
              key={i}
              className={`max-w-[60ch] text-[17px] font-light leading-[1.7] text-deep/85 ${
                i === 0 ? "mt-5" : "mt-4"
              }`}
            >
              {paragraph}
            </p>
          ))}
        </>
      ),
    });
  }

  const includes = filled(item.includes);
  if (includes.length) {
    sections.push({
      key: "includes",
      content: (
        <>
          <Kicker>{t("detail.includesLabel")}</Kicker>
          <ul className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {includes.map((line, i) => {
              // "Label — items, items" renders the label as a small-caps lead
              // so a long bullet can be scanned; anything else renders whole.
              const { label, rest } = splitLabel(line);
              return (
                <li key={i} className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.1em] h-px w-5 shrink-0 bg-clay"
                  />
                  <span className="text-[16px] leading-[1.6] text-deep/85">
                    {label && (
                      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.15em] text-brown">
                        {label}
                      </span>
                    )}
                    {rest}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ),
    });
  }

  const process = filled(item.process);
  if (process.length) {
    sections.push({
      key: "process",
      content: (
        <>
          <Kicker>{t("detail.processLabel")}</Kicker>
          {/* Numbered, echoing the Método treatment. Numbering follows the
              surviving steps, so a blank entry can't leave a gap in the count. */}
          <ol className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((step, i) => (
              <li key={i}>
                <span className="block font-serif text-[40px] leading-none text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-[16px] leading-[1.6] text-deep/85">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </>
      ),
    });
  }

  const difference = filled(item.difference);
  if (difference.length) {
    sections.push({
      key: "difference",
      content: (
        <>
          <Kicker>{t("detail.differenceLabel")}</Kicker>
          {difference.map((paragraph, i) => (
            <p
              key={i}
              className={`max-w-[60ch] font-serif text-[24px] italic leading-[1.4] text-brown sm:text-[28px] ${
                i === 0 ? "mt-5" : "mt-4"
              }`}
            >
              {paragraph}
            </p>
          ))}
        </>
      ),
    });
  }

  return (
    <article>
      {/* PAGE HERO — editorial image with the service title + tagline overlaid,
          or the plain dark band when no image is available. */}
      <PageHero
        pageKey="servicios"
        item={{
          kicker: t("kicker"),
          title: item.title,
          tagline: item.tagline,
          image: heroSrc
            ? {
                heroSrc,
                heroAlt: "",
                heroName: item.title,
                heroTagline: item.tagline,
              }
            : undefined,
        }}
      />

      {/* BODY */}
      <Section>
        <a
          href={`/${locale}/services`}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          <span aria-hidden>←</span>
          {t("detail.backLink")}
        </a>

        {sections.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 flex flex-col gap-16"
          >
            {sections.map(({ key, content }, i) => (
              <motion.p
                key={key}
                variants={reveal}
                // Rule between blocks, never above the first one.
                className={i > 0 ? "border-t border-line pt-10" : undefined}
              >
                {content}
              </motion.p>
            ))}
          </motion.div>
        )}
      </Section>

      {/* CONTACT CTA — dark band, preserving the existing contact pre-fill params. */}
      <section className="px-6 pb-20 pt-2 sm:px-10 lg:px-12">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto w-full max-w-[1240px] rounded-card bg-deep px-6 py-16 text-cream sm:px-12 lg:px-16"
        >
          <Kicker tone="sand">{t("detail.ctaKicker")}</Kicker>
          <SerifHeading
            as="h2"
            className="mt-5 max-w-[20ch] text-[30px] leading-[1.08] sm:text-[40px]"
          >
            {t("detail.ctaHeadline")}
          </SerifHeading>
          <p className="mt-5 max-w-[48ch] text-[15px] font-light leading-[1.6] text-cream/75">
            {t("detail.ctaBody")}
          </p>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <CTALink
              href={contactoHref(locale, {
                servicio: service.key,
                interes: service.interes,
              })}
              variant="onDark"
            >
              {item.cta}
            </CTALink>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] uppercase tracking-[0.16em] text-cream/75 underline-offset-4 transition-colors duration-300 hover:text-cream hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {t("detail.ctaWhatsapp")}
              </a>
            )}
          </div>
        </motion.div>
      </section>
    </article>
  );
}
