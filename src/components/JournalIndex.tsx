"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { JournalCard } from "@/components/JournalCard";
import {
  JournalFilters,
  type CategoryFilter,
  type JournalCategory,
} from "@/components/JournalFilters";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { JOURNAL_POSTS_QUERY_RESULT } from "@/sanity/types.gen";

/** Articles revealed per step. The metadata is cheap; the cover images aren't. */
const PAGE_SIZE = 12;

/** Schema order, so the chips read the same as the Studio's category list. */
const CATEGORY_ORDER = [
  "barrios",
  "lifestyle",
  "inversion",
  "interiorismo",
  "guias",
] as const satisfies readonly JournalCategory[];

/**
 * Fold case and strip diacritics so "gracia" matches "Gràcia". NFD splits an
 * accented character into its base letter plus a combining mark; the range
 * below is the combining-diacritics block, so only the marks are dropped and
 * the base letters survive.
 */
function normalise(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * The Journal index grid, with category filter, search and progressive reveal.
 *
 * All three run client-side over the full fetch the page already makes: the
 * metadata payload is small, and what actually costs is rendering a cover image
 * per article — which is what the reveal limits. No query changes, so the
 * server component above stays a server component.
 */
export function JournalIndex({ posts }: { posts: JOURNAL_POSTS_QUERY_RESULT }) {
  const t = useTranslations("journal");
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Index of the first article revealed by the last "Ver más", so focus can
  // land there once it's rendered instead of being dropped at the top. A ref
  // rather than state: it's a one-shot instruction to the effect below, and
  // nothing renders from it.
  const pendingFocus = useRef<number | null>(null);
  const itemRefs = useRef(new Map<number, HTMLLIElement | null>());

  // Offer a chip only where it leads somewhere — an empty filter is a dead end.
  const availableCategories = useMemo(() => {
    const present = new Set(posts.map((post) => post.category));
    return CATEGORY_ORDER.filter((value) => present.has(value));
  }, [posts]);

  const filtered = useMemo(() => {
    const needle = normalise(query.trim());
    return posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (!needle) return true;
      const haystack = normalise(`${post.title ?? ""} ${post.excerpt ?? ""}`);
      return haystack.includes(needle);
    });
  }, [posts, category, query]);

  // Runs once the newly revealed articles are in the DOM.
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    itemRefs.current.get(index)?.focus();
  }, [visibleCount]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visible.length;

  const showMore = () => {
    pendingFocus.current = visibleCount;
    setVisibleCount((count) => count + PAGE_SIZE);
  };

  // A narrowed result set should start from the top, not mid-reveal. Reset at
  // the point the filter changes rather than in an effect reacting to it —
  // these are the only three routes that can change either input.
  const selectCategory = (value: CategoryFilter) => {
    setCategory(value);
    setVisibleCount(PAGE_SIZE);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setCategory("all");
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  // No articles at all is a different state from no matches, and keeps its
  // original "nothing published yet" copy.
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

      <JournalFilters
        categories={availableCategories}
        selected={category}
        onSelect={selectCategory}
        query={query}
        onQueryChange={changeQuery}
      />

      {/* Rendered from the start so later count changes are announced as
          updates rather than as a region appearing. */}
      <p role="status" aria-live="polite" className="sr-only">
        {t("resultsCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-14">
          <p className="max-w-[46rem] font-serif text-[24px] leading-[1.3] text-deep/70 sm:text-[28px]">
            {t("noResults")}
          </p>
          <CTAButton onClick={resetFilters} className="mt-8">
            {t("resetFilters")}
          </CTAButton>
        </div>
      ) : (
        <>
          <motion.ul
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((post, index) => (
              <motion.li
                key={post._id}
                variants={item}
                // Focus target for "Ver más" — not in the tab order, so it
                // never adds a stop for anyone tabbing through the grid.
                tabIndex={-1}
                ref={(element) => {
                  itemRefs.current.set(index, element);
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-4 focus-visible:ring-offset-ivory"
              >
                <JournalCard post={post} />
              </motion.li>
            ))}
          </motion.ul>

          {hasMore && (
            <div className="mt-16 flex justify-center">
              <CTAButton onClick={showMore}>{t("loadMore")}</CTAButton>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
