"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { urlFor } from "@/sanity/lib/image";

export type JournalCardPost = {
  _id: string;
  slug: string | null;
  category: string | null;
  publishedAt: string | null;
  title: string | null;
  excerpt: string | null;
  coverImage: { asset?: { _ref?: string }; alt?: string | null } | null;
};

/**
 * Editorial article card — cover image, category kicker, serif title, excerpt
 * and date. Shared by the Journal index grid and the home-page teaser.
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

  const src = post.coverImage?.asset
    ? urlFor(post.coverImage).width(1000).height(750).fit("crop").url()
    : null;

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
              alt={post.coverImage?.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-sand/40" aria-hidden />
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
