"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { JournalCard, type JournalCardPost } from "@/components/JournalCard";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { JOURNAL_POSTS_QUERY_RESULT } from "@/sanity/types.gen";

export function JournalIndex({ posts }: { posts: JOURNAL_POSTS_QUERY_RESULT }) {
  const t = useTranslations("journal");
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  if (!posts.length) {
    return (
      <Section>
        <p className="max-w-[46rem] font-serif text-[24px] leading-[1.3] text-deep/70 sm:text-[28px]">
          {t("empty")}
        </p>
      </Section>
    );
  }

  return (
    <Section aria-labelledby="journal-grid">
      <h2 id="journal-grid" className="sr-only">
        {t("kicker")}
      </h2>
      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <motion.li key={post._id} variants={item}>
            <JournalCard post={post as JournalCardPost} />
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
