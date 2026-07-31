"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { posterUrl } from "@/lib/cloudinary";
import { urlFor } from "@/sanity/lib/image";
import type {
  JOURNAL_POSTS_QUERY_RESULT,
  RECENT_JOURNAL_POSTS_QUERY_RESULT,
} from "@/sanity/types.gen";

/**
 * Derived from the generated query results rather than hand-written, so a field
 * added to either card query shows up here instead of being silently dropped.
 * The teaser query omits `author`, which this card never reads, so a union of
 * the two element types covers both call sites without a cast.
 */
export type JournalCardPost =
  | JOURNAL_POSTS_QUERY_RESULT[number]
  | RECENT_JOURNAL_POSTS_QUERY_RESULT[number];

/** Clip length as m:ss — these run a couple of minutes at most. */
function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Editorial article card — cover image, category kicker, serif title, excerpt
 * and date. Shared by the Journal index grid and the home-page teaser. Articles
 * carrying an owner-interview video get a play icon and duration badge.
 */
export function JournalCard({ post }: { post: JournalCardPost }) {
  const locale = useLocale();
  const t = useTranslations("journal");
  const tc = useTranslations("journal.categories");

  const categoryLabel = post.category ? tc(post.category) : "";
  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat(t("dateLocale"), {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : "";

  // Image cascade: cover image → a frame pulled from the video itself.
  // Video-led articles often have no cover image at all, and an empty
  // placeholder on the card would misrepresent them. The Cloudinary frame is
  // vertical and gets object-cover cropped by the 4/3 container, which is the
  // right trade here — a letterboxed thumbnail would look broken in the grid.
  const src = post.coverImage?.asset
    ? urlFor(post.coverImage).width(1000).height(750).fit("crop").url()
    : post.videoPublicId
      ? posterUrl(post.videoPublicId)
      : null;

  // The auto-frame has no editorial alt text of its own; the badge and title
  // already say what it is, so it stays decorative.
  const alt = post.coverImage?.alt ?? "";

  const href = post.slug ? `/${locale}/journal/${post.slug}` : `/${locale}/journal`;

  return (
    <article className="group flex flex-col">
      <a
        href={href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-4 focus-visible:ring-offset-ivory"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-cream">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-sand/40" aria-hidden />
          )}

          {post.videoDuration != null && (
            <p className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-card bg-deep/70 px-2 py-1 text-[11px] tracking-[0.08em] text-cream">
              <span className="sr-only">{t("hasVideo")}</span>
              <Play className="h-3 w-3 fill-current" aria-hidden />
              {formatDuration(post.videoDuration)}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <p className="flex flex-wrap items-center gap-x-2 text-[11px] uppercase tracking-[0.18em] text-clay">
            {categoryLabel && <span>{categoryLabel}</span>}
            {categoryLabel && formattedDate && (
              <span aria-hidden className="text-line">
                ·
              </span>
            )}
            {formattedDate && (
              <span className="text-muted normal-case tracking-[0.08em]">
                {formattedDate}
              </span>
            )}
          </p>

          <h3 className="mt-3 font-serif text-[24px] font-medium leading-[1.12] tracking-[-0.025em] text-deep transition-colors duration-300 group-hover:text-brown sm:text-[27px]">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-3 text-[14px] font-light leading-[1.6] text-deep/75">
              {post.excerpt}
            </p>
          )}

          <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-brown/70 underline-offset-4 transition-colors duration-300 group-hover:text-brown group-hover:underline">
            {t("readMore")}
          </span>
        </div>
      </a>
    </article>
  );
}
