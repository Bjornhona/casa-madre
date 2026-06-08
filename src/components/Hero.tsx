"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { CTALink } from "@/components/ui/CTALink";
import { EASE } from "@/lib/motion";

// Tasteful warm-Mediterranean placeholder (matches the approved concept).
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85";

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Very subtle slow parallax + scale on the background as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const y = reduce ? undefined : yRaw;
  const scale = reduce ? undefined : scaleRaw;

  // Mount: stagger monogram → wordmark → descriptor → claim → CTA.
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.22,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
      };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-svh items-center justify-center overflow-hidden text-center text-cream"
    >
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Decorative full-bleed background; all meaning is carried by the text. */}
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Legibility scrim + soft centre vignette. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(43,33,27,0.45),rgba(43,33,27,0.32))]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,33,27,0)_30%,rgba(43,33,27,0.45)_100%)]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[920px] px-6 [text-shadow:0_2px_30px_rgba(43,33,27,0.55)]"
      >
        <motion.div
          variants={item}
          className="font-serif text-[72px] leading-[0.75] tracking-[-0.14em] text-sand sm:text-[92px]"
        >
          CM
        </motion.div>
        <motion.h1
          variants={item}
          className="mt-7 pl-[0.22em] font-serif text-[36px] uppercase tracking-[0.22em] sm:text-[55px]"
        >
          {t("brand")}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-3.5 text-[12px] uppercase tracking-[0.42em] text-cream/90"
        >
          {t("descriptor")}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-12 text-[15px] uppercase tracking-[0.42em] text-sand"
        >
          {t("claim")}
        </motion.p>
        <motion.div variants={item} className="mt-10">
          <CTALink href="#contacto" variant="onDark">
            {t("cta")}
          </CTALink>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-cream/80"
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
