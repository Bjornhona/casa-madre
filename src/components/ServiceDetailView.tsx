"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
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
  tagline: string;
  intro: string;
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
          href={`/${locale}/servicios`}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          <span aria-hidden>←</span>
          {t("detail.backLink")}
        </a>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 flex flex-col gap-16"
        >
          {/* Intro */}
          <motion.p
            variants={reveal}
            className="max-w-[65ch] text-[19px] font-light leading-[1.75] text-deep/85 sm:text-[21px]"
          >
            {item.intro}
          </motion.p>

          {/* Para quién es / Who it's for */}
          <motion.div variants={reveal} className="border-t border-line pt-10">
            <Kicker>{t("detail.forWhoLabel")}</Kicker>
            <p className="mt-5 max-w-[60ch] text-[17px] font-light leading-[1.7] text-deep/85">
              {item.forWho}
            </p>
          </motion.div>

          {/* Qué incluye / What's included */}
          <motion.div variants={reveal} className="border-t border-line pt-10">
            <Kicker>{t("detail.includesLabel")}</Kicker>
            <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {item.includes.map((line, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.1em] h-px w-5 shrink-0 bg-clay"
                  />
                  <span className="text-[16px] leading-[1.6] text-deep/85">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Cómo trabajamos / How we work — numbered, echoing the Método treatment */}
          <motion.div variants={reveal} className="border-t border-line pt-10">
            <Kicker>{t("detail.processLabel")}</Kicker>
            <ol className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {item.process.map((step, i) => (
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
          </motion.div>

          {/* Qué nos diferencia / What sets us apart */}
          <motion.div variants={reveal} className="border-t border-line pt-10">
            <Kicker>{t("detail.differenceLabel")}</Kicker>
            <p className="mt-5 max-w-[60ch] font-serif text-[24px] italic leading-[1.4] text-brown sm:text-[28px]">
              {item.difference}
            </p>
          </motion.div>
        </motion.div>
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
