"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { CTALink } from "@/components/ui/CTALink";
import { EASE, itemAnimation, staggerContainer } from "@/lib/motion";
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
        className="relative z-10 max-w-[920px] px-6"
      >
        <motion.img
          variants={item}
          src="/casa-madre-logo.webp"
          alt="Casa Madre"
          width={100}
          height={100}
          className="w-auto h-[100px] object-contain mx-auto mb-4"
        />
        <motion.h1
          variants={item}
          className="mt-[-0.25em] pl-[0.22em] font-serif text-[28px] text-cream uppercase tracking-[0.22em] sm:text-[50px]"
        >
          {t("brand")}
        </motion.h1>

        <motion.div
          className={`flex items-center gap-4 w-full`}
          initial={{ opacity: 0, scaleX: 0.2 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div
            className="flex-1 h-px bg-ivory/90"
            style={{
              maskImage: "linear-gradient(to right, transparent, black)",
            }}
          />
          <span className="w-2 h-2 bg-ivory/90 rounded-full" />
          <div
            className="flex-1 h-px bg-ivory/90"
            style={{
              maskImage: "linear-gradient(to left, transparent, black)",
            }}
          />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-3.5 text-[12px] uppercase tracking-[0.42em] text-ivory/90"
        >
          {t("descriptor")}
        </motion.p>
        {/* <motion.p
          variants={item}
          className="mt-12 text-[15px] uppercase tracking-[0.42em] text-clay"
        >
          {t("claim")}
        </motion.p> */}

        {/* Emotional tagline — unhurried fade-up ~1s after load, calm and slow. */}
        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: reduce ? 0 : 1 }}
          className="mx-auto mt-8 max-w-[34ch] font-serif text-[20px] italic leading-[1.4] text-sand sm:text-[26px]"
        >
          {t("tagline")}
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
