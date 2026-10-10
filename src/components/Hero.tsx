"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { CTALink } from "@/components/ui/CTALink";
import { itemAnimation, staggerContainer } from "@/lib/motion";
import { HERO_VIDEO_MP4, heroPoster } from "@/lib/hero-media";
import { HeroBackground } from "./HeroBackground";
import { OceanSound } from "./OceanSound";

// Hero background assets live in @/lib/hero-media so the coming-soon holding
// page can reuse the same poster. Swap to the final encoded files there when
// they're delivered (the poster is still the Mediterranean placeholder still).

// "video" = cinemagraph clip; "kenburns" = lightweight slow-zoom still fallback.
const HERO_MODE: "video" | "kenburns" = "video";

// "warm" = subtle warm-dark gradient (light/bright clip); "light" = soft cream
// glow behind the content for legibility over darker, more cinematic footage.
const HERO_SCRIM: "warm" | "light" = "warm";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const container = staggerContainer(reduce, 0.22);
  const item = itemAnimation(reduce);

  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center justify-center overflow-hidden text-center text-cream"
    >
      <HeroBackground
        mode={HERO_MODE}
        scrim={HERO_SCRIM}
        poster={heroPoster.src}
        videoMp4={HERO_VIDEO_MP4}
      />
      <OceanSound />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-230 px-6"
      >
        <div className="mx-auto">
          <motion.img
            variants={item}
            src="/casa-madre-logo.webp"
            alt="Casa Madre"
            width={100}
            height={100}
            className="ml-8 sm:ml-20 h-27.5 sm:h-40 w-auto object-contain mb-4"
          />
        </div>
        <motion.h1
          variants={item}
          className="mt-[-0.25em] pl-[0.22em] font-serif text-[34px] text-cream uppercase tracking-[0.22em] sm:text-[52px]"
        >
          {t("brand")}
        </motion.h1>

        <motion.p
          variants={item}
          className="text-[18px] uppercase tracking-[0.42em] text-cream/90"
        >
          {t("descriptor")}
        </motion.p>

        <motion.div variants={item} className="mt-10">
          <CTALink href={`/${locale}/contact`} variant="onDark">
            {t("cta")}
          </CTALink>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-deep/80"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <ChevronDown className="h-6 w-6" strokeWidth={1} />
      </motion.div>
    </section>
  );
}
