"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Mail, MessageCircle } from "lucide-react";
import { ctaClass } from "@/components/ui/cta-styles";
import { heroPoster } from "@/lib/hero-media";
import { itemAnimation, staggerContainer } from "@/lib/motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/**
 * Premium "coming soon" holding page — quiet, editorial, on-brand. Reuses the
 * locked Hero monogram + wordmark treatment over the homepage hero still, with
 * a single slow fade-in on load.
 */
export function ComingSoon() {
  const tHero = useTranslations("hero");
  const t = useTranslations("comingSoon");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const container = staggerContainer(reduce, 0.18);
  const item = itemAnimation(reduce);

  const year = new Date().getFullYear();

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-ivory px-6 py-10 text-center text-deep sm:px-10">
      {/* Same still the homepage hero paints, via @/lib/hero-media. Statically
          imported, so `placeholder="blur"` gets its blurDataURL for free.
          The source is ~2.56:1, so a portrait phone shows only ~18% of its
          width. Dead centre there is bare sky and the page reads as blank
          cream, so below `sm` the focal point moves right onto the sun's
          reflection on the water — still bright enough for the dark type, but
          with something actually in frame. Desktop keeps the full composition. */}
      <Image
        src={heroPoster}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover object-[64%_50%] sm:object-center"
      />

      {/* Scrim, mirroring HeroBackground's `warm` + `light` treatments so the
          holding page reads as the same room as the homepage hero: a gentle
          vertical cream wash, plus a stronger glow concentrated behind the
          centred content. Weighted this way rather than as one flat wash so
          the photograph still reads at the edges of the frame while
          text-deep / text-brown / text-muted stay above AA where they sit. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/20 to-cream/45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 56% at 50% 46%, color-mix(in srgb, var(--color-cream) 78%, transparent), transparent 76%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center"
      >
        {/* Monogram + wordmark — the locked Hero treatment. */}
        <motion.img
          variants={item}
          src="/casa-madre-logo.webp"
          alt="Casa Madre"
          width={120}
          height={120}
          className="mx-auto h-[110px] w-auto object-contain sm:h-[140px]"
        />
        <motion.h1
          variants={item}
          className="mt-[-0.25em] pl-[0.22em] font-serif text-[34px] uppercase tracking-[0.22em] text-deep sm:text-[52px]"
        >
          {tHero("brand")}
        </motion.h1>

        {/* Hairline + dot divider — matches the Hero. */}
        <motion.div
          variants={item}
          className="flex w-full items-center gap-4"
        >
          <div
            className="h-px flex-1 bg-deep/80"
            style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
          />
          <span className="h-2 w-2 rounded-full bg-deep/80" />
          <div
            className="h-px flex-1 bg-deep/80"
            style={{ maskImage: "linear-gradient(to left, transparent, black)" }}
          />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-3.5 text-[12px] uppercase tracking-[0.42em] text-deep/80"
        >
          {tHero("descriptor")}
        </motion.p>

        {/* Main line — serif display, matching SerifHeading's locked tracking. */}
        <motion.p
          variants={item}
          className="mt-12 max-w-[18ch] font-serif font-medium tracking-[-0.035em] text-[30px] leading-[1.12] text-brown sm:text-[44px]"
        >
          {t("title")}
        </motion.p>

        {/* Sub line */}
        <motion.p
          variants={item}
          className="mt-6 max-w-[46ch] text-[15px] font-light leading-[1.7] text-muted"
        >
          {t("subtitle")}
        </motion.p>

        {/* Contact prompt + channels */}
        {(CONTACT_EMAIL || WHATSAPP) && (
          <motion.div variants={item} className="mt-12 flex flex-col items-center">
            <p className="text-[12px] uppercase tracking-[0.22em] text-brown">
              {t("contact")}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {/* ctaClass rather than CTALink: these carry mailto / target,
                  which that primitive's href-only API doesn't expose. */}
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className={ctaClass("onLight", "inline-flex items-center gap-2.5")}
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t("ctaEmail")}
                </a>
              )}
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClass("onLight", "inline-flex items-center gap-2.5")}
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t("ctaWhatsapp")}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: reduce ? 0 : 0.9 }}
        className="relative z-10 mt-10 text-[11px] uppercase tracking-[0.22em] text-muted/80"
      >
        © {year} Casa Madre · Barcelona
        <span className="sr-only"> · {locale.toUpperCase()}</span>
      </motion.footer>

      {/* Team entry point. Deliberately quiet — a client's eye should slide off
          it, while anyone who knows it's there can find it. Opacity is the only
          thing dialled down: it sits in the tab order, takes a visible focus
          ring, and carries a full label for screen readers.
          Pinned to the corner from `sm` up; below that the footer line is
          nearly full-width, so it stacks underneath instead of overlapping. */}
      <Link
        href={`/${locale}/acceso`}
        aria-label={t("accessAria")}
        className="relative z-10 mt-3 inline-flex items-center gap-1.5 self-center p-2 text-[10px] uppercase tracking-[0.18em] text-deep/35 transition-colors duration-500 ease-out hover:text-deep/70 focus-visible:text-deep/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brown/60 sm:absolute sm:bottom-7 sm:right-7 sm:mt-0"
      >
        <Lock className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        <span aria-hidden>{t("access")}</span>
      </Link>
    </main>
  );
}
