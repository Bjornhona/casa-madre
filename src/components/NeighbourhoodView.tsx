"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { PortableTextBlock } from "@portabletext/react";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { JournalPortableText } from "@/components/JournalPortableText";
import {
  EASE,
  fadeUp,
  heroScaleAnimation,
  restrainedAnimation,
  staggerContainer,
} from "@/lib/motion";
import { contactoHref } from "@/lib/contacto-href";
import { urlFor } from "@/sanity/lib/image";
import type { NEIGHBOURHOOD_BY_SLUG_QUERY_RESULT } from "@/sanity/types.gen";

type Neighbourhood = NonNullable<NEIGHBOURHOOD_BY_SLUG_QUERY_RESULT>;

// Public env — safe in the client bundle. Stripped to digits for the wa.me link.
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

export function NeighbourhoodView({ barrio }: { barrio: Neighbourhood }) {
  const t = useTranslations("barrios.detail");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const heroSrc = barrio.heroImage?.asset
    ? urlFor(barrio.heroImage).width(2000).height(1100).fit("crop").url()
    : barrio.image?.asset
      ? urlFor(barrio.image).width(2000).height(1100).fit("crop").url()
      : null;
  const heroAlt = barrio.heroImage?.alt ?? barrio.image?.alt ?? "";

  const gallery = (barrio.gallery ?? []).filter((g) => g?.asset);
  const highlights = (barrio.highlights ?? []).filter((h) => h?.label || h?.value);
  const body = barrio.body ?? [];

  const restrained = restrainedAnimation(reduce);
  const heroScale = heroScaleAnimation(reduce);
  const container = staggerContainer(reduce, 0.1);
  const galleryItem = fadeUp(reduce, { y: 24, duration: 0.7 });

  return (
    <article>
      {/* HERO — heroImage full-bleed with the name + lifestyle line, or a dark
          band fallback when no image is set yet. */}
      {heroSrc ? (
        <section className="relative flex h-[64vh] min-h-[460px] w-full items-end overflow-hidden text-cream">
          <motion.div
            variants={heroScale}
            initial="hidden"
            animate="show"
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={heroSrc}
              alt={heroAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(rgba(43,33,27,0.1),rgba(43,33,27,0.62))]"
          />
          <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 pb-12 sm:px-10 lg:px-12">
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            >
              <Kicker tone="sand">{t("kicker")}</Kicker>
              <SerifHeading
                as="h1"
                className="mt-4 max-w-[16ch] text-[44px] leading-[1.02] sm:text-[64px]"
              >
                {barrio.name}
              </SerifHeading>
              {barrio.blurb && (
                <p className="mt-5 max-w-[48ch] text-[17px] font-light leading-[1.6] text-cream/85">
                  {barrio.blurb}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="bg-deep px-6 pt-36 pb-16 text-cream sm:px-10 lg:px-12 lg:pt-40">
          <div className="mx-auto w-full max-w-[1240px]">
            <Kicker tone="sand">{t("kicker")}</Kicker>
            <SerifHeading
              as="h1"
              className="mt-4 max-w-[16ch] text-[44px] leading-[1.02] sm:text-[64px]"
            >
              {barrio.name}
            </SerifHeading>
            {barrio.blurb && (
              <p className="mt-5 max-w-[48ch] text-[17px] font-light leading-[1.6] text-cream/85">
                {barrio.blurb}
              </p>
            )}
          </div>
        </section>
      )}

      {/* BODY */}
      <section className="px-6 pt-12 pb-4 sm:px-10 sm:pt-16 lg:px-12">
        <div className="mx-auto w-full max-w-[1240px]">
          <a
            href={`/${locale}/barrios`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <span aria-hidden>←</span>
            {t("backLink")}
          </a>

          {/* Intro paragraph — the editorial "feel" of the barrio. */}
          {barrio.intro && (
            <motion.p
              variants={restrained}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              className="mt-10 max-w-[60ch] font-serif text-[24px] italic leading-[1.4] text-brown sm:text-[29px]"
            >
              {barrio.intro}
            </motion.p>
          )}

          {/* Rich body — same editorial treatment as the journal article. */}
          {body.length > 0 && (
            <motion.div
              variants={restrained}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="mt-10 max-w-[65ch]"
            >
              <JournalPortableText value={body as unknown as PortableTextBlock[]} />
            </motion.div>
          )}

          {/* Editorial gallery */}
          {gallery.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
            >
              {gallery.map((img, i) => (
                <motion.div
                  key={img._key ?? `g-${i}`}
                  variants={galleryItem}
                  className={`relative aspect-[4/3] overflow-hidden rounded-card bg-cream ${
                    gallery.length % 2 === 1 && i === 0 ? "sm:col-span-2 sm:aspect-[16/7]" : ""
                  }`}
                >
                  <Image
                    src={urlFor(img).width(1400).height(1050).fit("crop").url()}
                    alt={img.alt ?? ""}
                    fill
                    loading="lazy"
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Highlights — warm editorial details, not a spec table. */}
          {highlights.length > 0 && (
            <div className="mt-16 border-t border-line pt-10">
              <Kicker>{t("highlightsLabel")}</Kicker>
              <dl className="mt-8 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <div key={i} className="border-t border-line pt-5">
                    {h.label && (
                      <dt className="text-[11px] uppercase tracking-[0.18em] text-clay">
                        {h.label}
                      </dt>
                    )}
                    {h.value && (
                      <dd className="mt-2 text-[17px] font-light leading-[1.6] text-deep/85">
                        {h.value}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT CTA — dark band, carrying the zona pre-fill into the form. */}
      <section className="px-6 pb-20 pt-10 sm:px-10 lg:px-12">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto w-full max-w-[1240px] rounded-card bg-deep px-6 py-16 text-cream sm:px-12 lg:px-16"
        >
          <Kicker tone="sand">{t("ctaKicker")}</Kicker>
          <SerifHeading
            as="h2"
            className="mt-5 max-w-[20ch] text-[30px] leading-[1.08] sm:text-[40px]"
          >
            {t("ctaHeadline")}
          </SerifHeading>
          <p className="mt-5 max-w-[48ch] text-[15px] font-light leading-[1.6] text-cream/75">
            {t("ctaBody")}
          </p>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <CTALink
              href={contactoHref(locale, { zona: barrio.name })}
              variant="onDark"
            >
              {t("ctaPrimary")}
            </CTALink>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] uppercase tracking-[0.16em] text-cream/75 underline-offset-4 transition-colors duration-300 hover:text-cream hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {t("ctaWhatsapp")}
              </a>
            )}
          </div>
        </motion.div>
      </section>
    </article>
  );
}
