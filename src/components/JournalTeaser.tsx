"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { CTALink } from "@/components/ui/CTALink";
import { JournalCard, type JournalCardPost } from "@/components/JournalCard";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { RECENT_JOURNAL_POSTS_QUERY_RESULT } from "@/sanity/types.gen";

export function JournalTeaser({
  posts,
}: {
  posts: RECENT_JOURNAL_POSTS_QUERY_RESULT;
}) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  // Nothing to tease yet — keep the home page tight rather than showing an
  // empty band.
  if (!posts.length) return null;

  return (
    <Section
      id="journal"
      aria-labelledby="journal-kicker"
      className="border-line border-b"
    >
      <Kicker id="journal-kicker">{t("teaserTitle")}</Kicker>
      <p className="mt-6 max-w-[46rem] font-serif text-[24px] leading-[1.2] text-deep sm:text-[29px]">
        {t("teaserIntro")}
      </p>

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <motion.li key={post._id} variants={item}>
            <JournalCard post={post as JournalCardPost} />
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-12">
        <CTALink href={`/${locale}/journal`}>{t("viewAll")}</CTALink>
      </div>
    </Section>
  );
}
