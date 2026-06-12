"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";
import { contactoHref } from "@/lib/contacto-href";
import { urlFor } from "@/sanity/lib/image";
import { fallbackImagesFor } from "@/lib/property-fallback-images";
import type { PROPERTY_BY_SLUG_QUERY_RESULT } from "@/sanity/types.gen";

type Property = NonNullable<PROPERTY_BY_SLUG_QUERY_RESULT>;

// Public env — safe in the client bundle. Stripped to digits for the wa.me link.
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

export function PropertyView({ property }: { property: Property }) {
  const t = useTranslations("propertyPage");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const operationLabel = t(`operationLabels.${property.operation}`);
  const typeLabel = t(`typeLabels.${property.propertyType}`);

  // Real gallery images, or warm placeholders until the client supplies photos.
  const realGallery = (property.gallery ?? []).filter((g) => g?.asset);
  const fallback = fallbackImagesFor(property.slug || property._id);

  const heroSrc = realGallery[0]
    ? urlFor(realGallery[0]).width(2000).height(1200).fit("crop").url()
    : fallback[0];
  const heroAlt = realGallery[0]?.alt ?? "";

  const gridImages = realGallery.length
    ? realGallery.slice(1).map((g, i) => ({
        src: urlFor(g).width(1200).height(900).fit("crop").url(),
        alt: g.alt ?? "",
        key: g._key ?? `g-${i}`,
      }))
    : fallback.slice(1).map((src, i) => ({ src, alt: "", key: `f-${i}` }));

  const specs = [
    property.surface != null ? `${property.surface} m²` : null,
    property.bedrooms != null
      ? `${property.bedrooms} ${t("specsLabels.bedrooms")}`
      : null,
    property.bathrooms != null
      ? `${property.bathrooms} ${t("specsLabels.bathrooms")}`
      : null,
    typeLabel,
  ].filter(Boolean) as string[];

  const container = staggerContainer(reduce, 0.12);
  const item = fadeUp(reduce, { y: 20, duration: 0.7 });
  const galleryContainer = staggerContainer(reduce, 0.08);
  const galleryItem = fadeUp(reduce, { y: 24, duration: 0.7 });

  // Hero: gentle scale-down on mount (1.03 → 1.0).
  const heroScale: Variants = reduce
    ? { hidden: { scale: 1 }, show: { scale: 1 } }
    : {
        hidden: { scale: 1.03 },
        show: { scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
      };

  return (
    <article>
      {/* HERO IMAGE */}
      <section className="relative h-[62vh] min-h-[440px] w-full overflow-hidden text-cream">
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
          className="absolute inset-0 bg-[linear-gradient(rgba(43,33,27,0.15),rgba(43,33,27,0.58))]"
        />
        <div className="relative z-10 mx-auto flex h-full max-w-[1240px] flex-col justify-end px-6 pb-10 sm:px-10 lg:px-12">
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="font-serif text-[20px] tracking-[0.01em] text-sand [text-shadow:0_2px_24px_rgba(43,33,27,0.5)] sm:text-[24px]"
          >
            {property.neighbourhood} · {operationLabel}
          </motion.p>
        </div>
      </section>

      {/* TITLE · PRICE · SPECS · DESCRIPTION · GALLERY · HIGHLIGHTS */}
      <section className="px-6 pt-12 pb-4 sm:px-10 sm:pt-16 lg:px-12">
        <div className="mx-auto w-full max-w-[1240px]">
          <a
            href={`/${locale}/propiedades`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <span aria-hidden>←</span>
            {t("backLink")}
          </a>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-8"
          >
            <motion.div variants={item}>
              <SerifHeading
                as="h1"
                className="max-w-[18ch] text-[40px] leading-[1.04] text-deep sm:text-[56px]"
              >
                {property.title}
              </SerifHeading>
            </motion.div>

            <motion.div variants={item} className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-[34px] leading-none text-brown sm:text-[42px]">
                {currency.format(property.price)}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-clay">
                {operationLabel}
              </span>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-light text-muted"
            >
              {specs.map((spec, i) => (
                <span key={spec} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span aria-hidden className="text-line">
                      ·
                    </span>
                  )}
                  {spec}
                </span>
              ))}
            </motion.p>
          </motion.div>

          {property.description && (
            <motion.p
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mt-10 max-w-[65ch] text-[17px] font-light leading-[1.75] text-deep/85"
            >
              {property.description}
            </motion.p>
          )}

          {gridImages.length > 0 && (
            <motion.div
              variants={galleryContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            >
              {gridImages.map((img) => (
                <motion.div
                  key={img.key}
                  variants={galleryItem}
                  className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {property.highlights && property.highlights.length > 0 && (
            <div className="mt-16 border-t border-line pt-10">
              <Kicker>{t("featuresLabel")}</Kicker>
              <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {property.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="font-serif text-[20px] italic text-deep/80"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT CTA */}
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
              href={contactoHref(locale, {
                propiedad: property.slug,
                titulo: property.title,
                interes: property.operation === "venta" ? "buy" : "rent",
              })}
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
