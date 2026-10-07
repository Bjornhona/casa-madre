"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Mail, MessageCircle } from "lucide-react";
import { ctaClass } from "@/components/ui/cta-styles";
import { heroPoster, HERO_VIDEO_MP4 } from "@/lib/hero-media";
import { itemAnimation, staggerContainer } from "@/lib/motion";
import { HeroBackground } from "./HeroBackground";
import { HeroScrim } from "./HeroScrim";

/**
 * Play the hero cinemagraph here instead of the still.
 *
 * Off by default, deliberately: this page is hit cold, often on mobile data,
 * and its only job is to show one line of text. The poster under the same
 * shared scrim is visually indistinguishable at a fraction of the weight.
 * Flip to `true` to hand the background over to HeroBackground, which brings
 * the full autoplay/reduced-motion/save-data logic with it.
 */
const PLAY_HERO_VIDEO = false;
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/**
 * Premium "coming soon" holding page — quiet, editorial, on-brand. Reuses the
 * locked Hero monogram + wordmark treatment over the homepage hero still, with
 * a single slow fade-in on load.
 *
 * Background and colour scheme are the hero's: the same poster, the same scrim
 * layers (via HeroScrim) and the same type tokens over them, so the holding
 * page and the homepage read as one brand.
 *
 * CONTRAST — measured against the poster's brightest region inside the text
 * column (the sun/horizon band, raw rgb(240,230,215) at y≈50%), not an average:
 *
 *   scrim="warm" alone        cream 2.1:1 · ivory/90 1.9:1   ← the hero's setting
 *   scrim="warm" boost={55}   cream 5.8:1 · ivory/90 4.7:1 · sand 3.6:1
 *
 * The hero accepts ~2.1:1 because its type is atmosphere over a moving image.
 * Here the type IS the page, so the shared scrim gets `boost` — the same layer
 * stack, one stop deeper — to clear AA. Keep ivory at /90 for small and tracked
 * text: ivory/70 only reaches 3.6:1 mid-frame.
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
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-deep px-6 py-10 text-center text-cream sm:px-10">
      {PLAY_HERO_VIDEO ? (
        <HeroBackground
          mode="video"
          scrim="warm"
          poster={heroPoster.src}
          videoMp4={HERO_VIDEO_MP4}
        />
      ) : (
        <>
          {/* Same still the homepage hero paints, via @/lib/hero-media. Statically
              imported, so `placeholder="blur"` gets its blurDataURL for free.
              The source is 16:9, so a portrait phone shows only ~40% of its
              width. Dead centre there is bare sky, so below `sm` the focal point
              moves right onto the sun's reflection on the water — something
              actually in frame. Desktop keeps the full composition. */}
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
          {/* The hero's own scrim layers — see the contrast note above for why
              this page carries `boost` and the hero doesn't. Never re-declare
              these gradients here; HeroScrim is the only place they live. */}
          <HeroScrim scrim="warm" />
        </>
      )}

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
          className="mx-auto h-[110px] w-auto object-contain sm:h-[140px] mb-4"
        />
        <motion.h1
          variants={item}
          className="mt-[-0.25em] pl-[0.22em] font-serif text-[34px] uppercase tracking-[0.22em] text-cream sm:text-[52px]"
        >
          {tHero("brand")}
        </motion.h1>

        {/* Hairline + dot divider — matches the Hero, ivory/90 and all. */}
        <motion.div
          variants={item}
          className="flex w-full items-center gap-4"
        >
          <div
            className="h-px flex-1 bg-ivory/90"
            style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
          />
          <span className="h-2 w-2 rounded-full bg-ivory/90" />
          <div
            className="h-px flex-1 bg-ivory/90"
            style={{ maskImage: "linear-gradient(to left, transparent, black)" }}
          />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-3.5 text-[12px] uppercase tracking-[0.42em] text-ivory/90"
        >
          {tHero("descriptor")}
        </motion.p>

        {/* Main line — this page's equivalent of the Hero tagline, so it takes
            the Hero's serif accent colour. SerifHeading's locked tracking. */}
        <motion.p
          variants={item}
          className="mt-12 max-w-[22ch] font-serif font-medium tracking-[-0.035em] text-[30px] leading-[1.12] text-sand sm:text-[44px]"
        >
          {t("title")}
        </motion.p>

        {/* Sub line. ivory/90 rather than a dimmer step: small text over the
            poster's bright band needs the full weight to clear AA. */}
        <motion.p
          variants={item}
          className="mt-6 max-w-[46ch] text-[15px] font-light leading-[1.7] text-ivory/90"
        >
          {t("subtitle")}
        </motion.p>

        {/* Contact prompt + channels */}
        {(CONTACT_EMAIL || WHATSAPP) && (
          <motion.div variants={item} className="mt-12 flex flex-col items-center">
            <p className="text-[12px] uppercase tracking-[0.22em] text-ivory/90">
              {t("contact")}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              {/* ctaClass rather than CTALink: these carry mailto / target,
                  which that primitive's href-only API doesn't expose.
                  `onDark` is the Hero's variant — cream/70 outline, filling to
                  solid cream on hover, cream focus ring — now that this page
                  sits on imagery rather than ivory. */}
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className={ctaClass("onDark", "inline-flex items-center gap-2.5")}
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
                  className={ctaClass("onDark", "inline-flex items-center gap-2.5")}
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
        className="relative z-10 mt-10 text-[11px] uppercase tracking-[0.22em] text-ivory/90"
      >
        © {year} Casa Madre · Barcelona
        <span className="sr-only"> · {locale.toUpperCase()}</span>
      </motion.footer>

      {/* Team entry point. Deliberately quiet — a client's eye should slide off
          it, while anyone who knows it's there can find it. Opacity is the only
          thing dialled down: it sits in the tab order, takes a visible focus
          ring, and carries a full label for screen readers.
          Pinned to the corner from `sm` up; below that the footer line is
          nearly full-width, so it stacks underneath instead of overlapping.
          cream/60 measures 5.4:1 where it actually sits — the foot gradient
          makes that corner the darkest part of the frame — and resolves to
          full cream on hover / focus. */}
      <Link
        href={`/${locale}/acceso`}
        aria-label={t("accessAria")}
        className="relative z-10 mt-3 inline-flex items-center gap-1.5 self-center p-2 text-[10px] uppercase tracking-[0.18em] text-cream/60 transition-colors duration-500 ease-out hover:text-cream focus-visible:text-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/60 sm:absolute sm:bottom-7 sm:right-7 sm:mt-0"
      >
        <Lock className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        <span aria-hidden>{t("access")}</span>
      </Link>
    </main>
  );
}
