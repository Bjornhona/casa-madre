"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import { itemAnimation, staggerContainer } from "@/lib/motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

// Shared CTA styling — mirrors CTALink (onLight) so the holding page reads as
// part of the same design system, but as anchors that can open a new tab /
// carry mailto without going through the component's href-only API.
const CTA_CLASS =
  "inline-flex items-center gap-2.5 border border-brown px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] text-brown transition-colors duration-500 ease-out hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory";

/**
 * Premium "coming soon" holding page — quiet, editorial, on-brand. Reuses the
 * locked Hero monogram + wordmark treatment over a clean ivory field (no
 * generic construction imagery), with a single slow fade-in on load.
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
      {/* Faint warm vignette — adds Mediterranean warmth without an image or any
          legibility cost. Purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 12%, color-mix(in srgb, var(--color-sand) 28%, transparent), transparent 60%)",
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
              {CONTACT_EMAIL && (
                <a href={`mailto:${CONTACT_EMAIL}`} className={CTA_CLASS}>
                  <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t("ctaEmail")}
                </a>
              )}
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={CTA_CLASS}
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
        initial={reduce ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: reduce ? 0 : 0.9 }}
        className="relative z-10 mt-10 text-[11px] uppercase tracking-[0.22em] text-muted/80"
      >
        © {year} Casa Madre · Barcelona
        <span className="sr-only"> · {locale.toUpperCase()}</span>
      </motion.footer>
    </main>
  );
}
