"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform
} from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { CTALink } from "@/components/ui/CTALink";
import { heroScaleAnimation, itemAnimation, staggerContainer } from "@/lib/motion";
import { OceanSound } from "./OceanSound";

const HERO_IMAGE = "/mediterranean-seaview.webp";
// const HERO_VIDEO = "/casa-madre-video.mp4";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
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

  const container = staggerContainer(reduce, 0.22);
  const heroScale = heroScaleAnimation(reduce);
  const item = itemAnimation(reduce);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-svh items-center justify-center overflow-hidden text-center text-cream"
    >
      <OceanSound />
      <motion.div
        style={{ y, scale }}
        variants={heroScale}
        initial="hidden"
        animate="show"
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* <video
          autoPlay
          muted={true}
          loop={false}
          playsInline={true}
          poster={HERO_IMAGE}
          className="object-cover w-full h-full"
          width={1000}
          height={1000}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video> */}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[920px] px-6"
      >
        <motion.img
          variants={item}
          src="/casa-madre-logo-red.png"
          alt="Casa Madre"
          width={100}
          height={100}
          className="w-auto h-[150px] object-contain mx-auto"
        />
        <motion.h1
          variants={item}
          className="mt-[-0.25em] pl-[0.22em] font-serif text-[36px] text-deep uppercase tracking-[0.22em] sm:text-[55px]"
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
            className="flex-1 h-px bg-deep/90"
            style={{
              maskImage: "linear-gradient(to right, transparent, black)",
            }}
          />
          <span className="w-2 h-2 bg-deep/90 rounded-full" />
          <div
            className="flex-1 h-px bg-deep/90"
            style={{
              maskImage: "linear-gradient(to left, transparent, black)",
            }}
          />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-3.5 text-[12px] uppercase tracking-[0.42em] text-deep/90"
        >
          {t("descriptor")}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-12 text-[15px] uppercase tracking-[0.42em] text-clay"
        >
          {t("claim")}
        </motion.p>
        <motion.div variants={item} className="mt-10">
          <CTALink href={`/${locale}/contacto`} variant="onLight">
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
