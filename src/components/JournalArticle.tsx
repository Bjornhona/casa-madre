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
  // head. Video articles take the compact header instead and lead with the
  // video. The cover image is still the card thumbnail and the OG image; only
  // its hero rendering is skipped here.
  const hasVideo = Boolean(post.video?.publicId);
  const showCoverHero = Boolean(cover) && !hasVideo;

  const restrained = restrainedAnimation(reduce);
  const heroScale = heroScaleAnimation(reduce);

  return (
    <article>
      {/* COVER HERO */}
      {showCoverHero && cover ? (
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
            {!showCoverHero && (
              <Kicker>
                {[categoryLabel, formattedDate].filter(Boolean).join(" · ")}
              </Kicker>
            )}
            <SerifHeading
              as="h1"
              className="mt-4 max-w-[20ch] text-[40px] leading-[1.06] text-deep sm:text-[56px]"
            >
              {post.title}
            </SerifHeading>

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

          {/* VIDEO — the interview leads the article, above the written body */}
          {post.video?.publicId && (
            <motion.div
              variants={restrained}
              initial="hidden"
              animate="show"
              className="mt-10 max-w-[65ch]"
            >
              <JournalVideo
                video={post.video}
                caption={post.videoCaption}
                title={post.title}
              />
            </motion.div>
          )}

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
