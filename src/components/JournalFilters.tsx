"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { FilterChip } from "@/components/ui/FilterChip";
import type { JOURNAL_POSTS_QUERY_RESULT } from "@/sanity/types.gen";

export type JournalCategory = JOURNAL_POSTS_QUERY_RESULT[number]["category"];

/** `all` is the unfiltered default, not a category the schema knows about. */
export type CategoryFilter = JournalCategory | "all";

type JournalFiltersProps = {
  /** Only categories at least one article actually uses. */
  categories: JournalCategory[];
  selected: CategoryFilter;
  onSelect: (value: CategoryFilter) => void;
  query: string;
  onQueryChange: (value: string) => void;
};

/**
 * The Journal index's filter row: category chips and a text search, both
 * controlled by JournalIndex so the two can be combined and reset together.
 *
 * Accessibility — the chips are toggle buttons inside a labelled `role="group"`,
 * not a `radiogroup`. A radiogroup is the tighter semantic match for
 * single-select, but the ARIA pattern obliges roving tabindex plus arrow-key
 * navigation; implemented short of that it strands keyboard users, who lose
 * Tab access to every option but one. Plain buttons keep native keyboard
 * behaviour (each chip is a tab stop, Enter and Space both activate) and
 * `aria-pressed` conveys the selected state. Mutual exclusion is then carried
 * by behaviour and by the result count announced in JournalIndex's live region.
 */
export function JournalFilters({
  categories,
  selected,
  onSelect,
  query,
  onQueryChange,
}: JournalFiltersProps) {
  const t = useTranslations("journal");
  const tc = useTranslations("journal.categories");
  const searchId = useId();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <div
        role="group"
        aria-label={t("filterLabel")}
        className="flex flex-wrap gap-2"
      >
        <FilterChip
          selected={selected === "all"}
          onClick={() => onSelect("all")}
        >
          {t("allCategories")}
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category}
            selected={selected === category}
            onClick={() => onSelect(category)}
          >
            {tc(category)}
          </FilterChip>
        ))}
      </div>

      <div className="lg:w-[300px] lg:shrink-0">
        <label htmlFor={searchId} className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full border-b border-brown/30 bg-transparent pb-2 text-[14px] font-light text-deep transition-colors duration-500 ease-out placeholder:text-brown/50 focus:border-brown focus:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        />
      </div>
    </div>
  );
}
