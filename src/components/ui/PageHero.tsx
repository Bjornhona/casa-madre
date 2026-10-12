"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { EASE, heroScaleAnimation } from "@/lib/motion";
import Image from "next/image";

interface PageHeroItem {
  image?: {
    heroSrc: string;
    heroAlt: string;
    heroName?: string;
    /** One entry per paragraph. Always an array — callers normalise. */
    heroTagline?: string[];
  };
  kicker?: string;
  title?: string;
  /** One entry per paragraph. Always an array — callers normalise. */
  tagline?: string[];
}

/**
 * Dark editorial header band for the sub-pages. Sits under the fixed cream nav
 * (which expects a dark surface beneath it), and gives each route a confident
 * title treatment built from the shared Kicker + SerifHeading primitives.
 *
 * Copy comes from the `pages.<pageKey>` catalog (kicker / title / intro), or
 * from `item` when a route supplies its own. Taglines are always `string[]`,
 * one entry per paragraph — the single-line catalog `intro` is wrapped here.
 */
export function PageHero({
  pageKey,
  item,
}: {
  pageKey: string;
  item?: PageHeroItem;
}) {
  const t = useTranslations(`pages.${pageKey}`);
  const reduce = useReducedMotion();
  const heroScale = heroScaleAnimation(reduce);

  const heroText = (kicker: string, title: string, tagline: string[]) => (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="mx-auto w-full max-w-[1240px]"
    >
      <Kicker tone="sand">{kicker}</Kicker>
      <SerifHeading
        as="h1"
        className="mt-5 max-w-[20ch] text-[40px] leading-[1.04] sm:text-[56px]"
      >
        {title}
      </SerifHeading>
      {tagline.map((line, i) => (
        <p
          key={line}
          className={`max-w-[52ch] text-cream/75 ${
            i === 0 ? "mt-5" : "mt-2"
          }`}
        >
          {line}
        </p>
      ))}
    </motion.div>
  );

  return item?.image ? (
    <section className="relative flex h-[54vh] min-h-[460px] w-full items-end overflow-hidden text-cream">
      <motion.div
        variants={heroScale}
        initial="hidden"
        animate="show"
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={item.image.heroSrc}
          alt={item.image.heroAlt}
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
      <div className="relative z-10 mx-auto w-full px-6 pt-36 pb-20 text-cream sm:px-10 lg:px-12 lg:pt-40 lg:pb-24">
        {heroText(
          item?.kicker ?? t("kicker"),
          item?.image?.heroName ?? item?.title ?? t("title"),
          item?.image?.heroTagline ?? item?.tagline ?? [t("intro")],
        )}
      </div>
    </section>
  ) : (
    <section className="bg-deep px-6 pt-36 pb-20 text-cream sm:px-10 lg:px-12 lg:pt-40 lg:pb-24">
      {heroText(
        item?.kicker ?? t("kicker"),
        item?.title ?? t("title"),
        item?.tagline ?? [t("intro")],
      )}
    </section>
  );
}
