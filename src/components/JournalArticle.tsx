"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { PortableTextBlock } from "@portabletext/react";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { JournalPortableText } from "@/components/JournalPortableText";
import { JournalVideo } from "@/components/JournalVideo";
import { EASE } from "@/lib/motion";
import { urlFor } from "@/sanity/lib/image";
import type { JOURNAL_POST_BY_SLUG_QUERY_RESULT } from "@/sanity/types.gen";
import { restrainedAnimation, heroScaleAnimation } from "@/lib/motion";

type Post = NonNullable<JOURNAL_POST_BY_SLUG_QUERY_RESULT>;

// Shared between the two heroes so the scrim over a cover image is identical
// in both. Keeps the video's edge legible against a bright photo.
const HERO_SCRIM = "bg-[linear-gradient(rgba(43,33,27,0.15),rgba(43,33,27,0.58))]";

// One title scale, two tones: dark on the ivory content measure, cream on the
// video band. Kept as whole literals so the no-video markup is untouched.
const TITLE_ON_LIGHT =
  "mt-4 max-w-[20ch] text-[40px] leading-[1.06] text-deep sm:text-[56px]";
const TITLE_ON_DARK =
  "mt-4 max-w-[20ch] text-[40px] leading-[1.06] text-cream sm:text-[56px]";

export function JournalArticle({ post }: { post: Post }) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const tc = useTranslations("journal.categories");
  const categoryLabel = post.category ? tc(post.category) : "";

  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat(t("dateLocale"), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : "";

  const cover = post.coverImage?.asset
    ? urlFor(post.coverImage).width(2000).height(1100).fit("crop").url()
    : null;
  const coverAlt = post.coverImage?.alt ?? "";

  // A vertical interview can't share the stage with the landscape full-bleed
  // hero — it would pillarbox behind huge black bars or crop the speaker's
  // head. Video articles get their own band instead: the portrait clip sits
  // over it, with the cover image behind on desktop only. The cover image is
  // still the card thumbnail and the OG image either way.
  const hasVideo = Boolean(post.video?.publicId);
  const showCoverHero = Boolean(cover) && !hasVideo;

  const kickerLine = [categoryLabel, formattedDate].filter(Boolean).join(" · ");

  const restrained = restrainedAnimation(reduce);
  const heroScale = heroScaleAnimation(reduce);

  return (
    <article>
      {/* VIDEO HERO — landscape band, portrait clip contained over it */}
      {hasVideo && post.video ? (
        <section className="relative overflow-hidden bg-deep text-cream">
          {/* Backdrop is desktop-only on purpose: a portrait clip nearly fills
              a phone, so a cover image behind it would survive as slivers top
              and bottom and read as a rendering bug. */}
          {cover && (
            <motion.div
              variants={heroScale}
              initial="hidden"
              animate="show"
              aria-hidden
              className="absolute inset-0 hidden will-change-transform lg:block"
            >
              <Image src={cover} alt="" fill sizes="100vw" className="object-cover" />
              <div className={`absolute inset-0 ${HERO_SCRIM}`} />
            </motion.div>
          )}

          {/* Height comes from the video plus padding — never a fixed vh, so a
              tall portrait clip is never cropped. */}
          <div className="relative z-10 mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-10 pt-16 pb-0 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 sm:pt-22 lg:px-10">
            {/* Beside the video on desktop; below the band on smaller screens,
                where there's no room for text next to a portrait clip. */}
            <motion.div
              variants={restrained}
              initial="hidden"
              animate="show"
              className="hidden lg:block"
            >
              <Kicker tone="sand">{kickerLine}</Kicker>
              <SerifHeading as="h1" className={TITLE_ON_DARK}>
                {post.title}
              </SerifHeading>
            </motion.div>

            <motion.div
              variants={restrained}
              initial="hidden"
              animate="show"
              className="w-full lg:justify-self-end"
            >
              <JournalVideo
                video={post.video}
                caption={post.videoCaption}
                title={post.title}
                portraitMaxWidth="max-w-[360px]"
              />
            </motion.div>
          </div>
        </section>
      ) : showCoverHero && cover ? (
        <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden text-cream">
          <motion.div
            variants={heroScale}
            initial="hidden"
            animate="show"
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={cover}
              alt={coverAlt}
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
              className="text-[11px] uppercase tracking-[0.22em] text-sand [text-shadow:0_2px_24px_rgba(43,33,27,0.5)]"
            >
              {[categoryLabel, formattedDate].filter(Boolean).join(" · ")}
            </motion.p>
          </div>
        </section>
      ) : (
        <div className="bg-deep pt-36 lg:pt-40" />
      )}

      {/* TITLE + BODY */}
      <section className="px-6 pt-12 pb-20 sm:px-10 sm:pt-16 lg:px-12">
        <div className="mx-auto w-full max-w-[1240px]">
          <a
            href={`/${locale}/journal`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <span aria-hidden>←</span>
            {t("backLink")}
          </a>

          <motion.div
            variants={restrained}
            initial="hidden"
            animate="show"
            className="mt-8"
          >
            {hasVideo ? (
              // On desktop these live in the band; only one of the two copies
              // is ever displayed, so only one reaches the a11y tree.
              <div className="lg:hidden">
                <Kicker>{kickerLine}</Kicker>
                <SerifHeading as="h1" className={TITLE_ON_LIGHT}>
                  {post.title}
                </SerifHeading>
              </div>
            ) : (
              <>
                {!showCoverHero && <Kicker>{kickerLine}</Kicker>}
                <SerifHeading as="h1" className={TITLE_ON_LIGHT}>
                  {post.title}
                </SerifHeading>
              </>
            )}

            {post.author && (
              <p className="mt-5 text-[12px] uppercase tracking-[0.18em] text-clay">
                {t("by")} {post.author}
              </p>
            )}

            {post.excerpt && (
              <p className="mt-7 max-w-[60ch] font-serif text-[22px] italic leading-[1.4] text-brown sm:text-[26px]">
                {post.excerpt}
              </p>
            )}
          </motion.div>

          {/* BODY — generous editorial measure (~65ch) */}
          {post.body && post.body.length > 0 && (
            <motion.div
              variants={restrained}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="mt-10 max-w-[65ch]"
            >
              <JournalPortableText
                value={post.body as unknown as PortableTextBlock[]}
              />
            </motion.div>
          )}
        </div>
      </section>
    </article>
  );
}
